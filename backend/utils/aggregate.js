const ObjectId = require("mongoose").Types.ObjectId;

const SORT = (sortBy, order) => ({
  $sort: {
    [sortBy]: order == "asc" ? 1 : -1,
  },
});

const SKIP = (page, per_page) => ({
  $skip: (page - 1) * per_page,
});

const LIMIT = (per_page) => ({
  $limit: per_page,
});

const LOOKUP_USER = () => [
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "userData",
    },
  },
  {
    $unwind: {
      path: "$userData",
    },
  },
];

const LOOKUP_CART = (userId) => [
  {
    $addFields: {
      loggedInUser: new ObjectId(userId),
      purchasers: {
        $ifNull: ["$purchasers", []],
      },
    },
  },
  {
    $addFields: {
      isPurchased: {
        $in: ["$loggedInUser", "$purchasers"],
      },
      totalPurchased: {
        $size: "$purchasers",
      },
    },
  },
  {
    $lookup: {
      from: "carts",
      localField: "loggedInUser",
      foreignField: "userId",
      as: "cartItem",
    },
  },
  {
    $unwind: {
      path: "$cartItem",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      cartItems: {
        $cond: [
          {
            $not: ["$cartItem"],
          },
          [],
          "$cartItem.items",
        ],
      },
    },
  },
  {
    $addFields: {
      isCartItem: {
        $cond: [
          {
            $in: ["$_id", "$cartItems"],
          },
          true,
          false,
        ],
      },
    },
  },
];

const LOOKUP_ORDER = (matchObj) => [
  {
    $match: {
      isDeleted: false,
      ...matchObj,
    },
  },
  {
    $sort: {
      order: -1,
    },
  },
  {
    $limit: 1,
  },
  {
    $project: {
      order: 1,
    },
  },
];

const LOOKUP_CATEGORY = [
  {
    $match: {
      isActive: true,
      isDeleted: false,
      parentId: {
        $exists: false,
      },
    },
  },
  {
    $lookup: {
      from: "productcategories",
      let: {
        id: "$_id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$parentId", "$$id"],
            },
            isActive: true,
            isDeleted: false,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
        {
          $lookup: {
            from: "productcategories",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$parentId", "$$id"],
                  },
                  isActive: true,
                  isDeleted: false,
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
              {
                $lookup: {
                  from: "productcategories",
                  let: {
                    id: "$_id",
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$parentId", "$$id"],
                        },
                        isActive: true,
                        isDeleted: false,
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                      },
                    },
                  ],
                  as: "levels",
                },
              },
            ],
            as: "levels",
          },
        },
      ],
      as: "levels",
    },
  },
  {
    $project: {
      _id: 1,
      name: 1,
      levels: 1,
    },
  },
];

const PRODUCT_PRICING_OLD = (
  countryId,
  userId,
  currentCurrency,
  usdCurrency
) => {
  /*
    Country Product Pricing
    Country Customer Group Pricing
    Country Product Group Pricing
    Country Category Pricing
    Customer Group Pricing
    Product Group Pricing
    Category Pricing
  */

  let USER_SPECIFIC_PRICING = [];

  if (userId) {
    USER_SPECIFIC_PRICING = [
      {
        $lookup: {
          from: "pricingnews",
          let: {
            id: "$categoryId",
          },
          pipeline: [
            {
              $match: {
                type: "customerGroup",
                parentType: "country",
                $expr: {
                  $eq: ["$categoryId", "$$id"],
                },
                countryId: new ObjectId(countryId),
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "groups",
                let: {
                  groupId: "$customerGroupId",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$groupId"],
                      },
                      isActive: true,
                      isDeleted: false,
                      $and: [
                        {
                          $expr: {
                            $in: [new ObjectId(userId), "$members"],
                          },
                        },
                      ],
                    },
                  },
                ],
                as: "groupData",
              },
            },
            {
              $unwind: {
                path: "$groupData",
              },
            },
            {
              $project: {
                _id: 0,
                value: 1,
              },
            },
          ],
          as: "countryCustomerGroupPricing",
        },
      },
      {
        $lookup: {
          from: "pricingnews",
          let: {
            id: "$categoryId",
          },
          pipeline: [
            {
              $match: {
                type: "customerGroup",
                parentType: "default",
                $expr: {
                  $eq: ["$categoryId", "$$id"],
                },
                isActive: true,
                isDeleted: false,
              },
            },
            {
              $lookup: {
                from: "groups",
                let: {
                  groupId: "$customerGroupId",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$groupId"],
                      },
                      isActive: true,
                      isDeleted: false,
                      $and: [
                        {
                          $expr: {
                            $in: [new ObjectId(userId), "$members"],
                          },
                        },
                      ],
                    },
                  },
                ],
                as: "groupData",
              },
            },
            {
              $unwind: {
                path: "$groupData",
              },
            },
            {
              $project: {
                _id: 0,
                value: 1,
              },
            },
          ],
          as: "customerGroupPricing",
        },
      },
    ];
  }

  return [
    {
      $lookup: {
        from: "pricingnews",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              type: "product",
              parentType: "country",
              $expr: {
                $eq: ["$productId", "$$id"],
              },
              countryId: new ObjectId(countryId),
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 0,
              value: 1,
            },
          },
        ],
        as: "countryProductPricing",
      },
    },
    {
      $lookup: {
        from: "pricingnews",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              type: "productGroup",
              parentType: "country",
              countryId: new ObjectId(countryId),
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "groups",
              let: {
                groupId: "$productGroupId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$groupId"],
                    },
                    isActive: true,
                    isDeleted: false,
                    $and: [
                      {
                        $expr: {
                          $in: ["$$id", "$members"],
                        },
                      },
                    ],
                  },
                },
              ],
              as: "groupData",
            },
          },
          {
            $unwind: {
              path: "$groupData",
            },
          },
          {
            $project: {
              _id: 0,
              value: 1,
            },
          },
        ],
        as: "countryProductGroupPricing",
      },
    },
    {
      $lookup: {
        from: "pricingnews",
        let: {
          categoryId: "$categoryId",
        },
        pipeline: [
          {
            $match: {
              type: "category",
              parentType: "country",
              $expr: {
                $eq: ["$categoryId", "$$categoryId"],
              },
              countryId: new ObjectId(countryId),
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 0,
              value: 1,
            },
          },
        ],
        as: "countryCategoryPricing",
      },
    },
    {
      $lookup: {
        from: "pricingnews",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              type: "productGroup",
              parentType: "default",
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "groups",
              let: {
                groupId: "$productGroupId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$groupId"],
                    },
                    isActive: true,
                    isDeleted: false,
                    $and: [
                      {
                        $expr: {
                          $in: ["$$id", "$members"],
                        },
                      },
                    ],
                  },
                },
              ],
              as: "groupData",
            },
          },
          {
            $unwind: {
              path: "$groupData",
            },
          },
          {
            $project: {
              _id: 0,
              value: 1,
            },
          },
        ],
        as: "productGroupPricing",
      },
    },
    {
      $lookup: {
        from: "pricingnews",
        let: {
          categoryId: "$categoryId",
        },
        pipeline: [
          {
            $match: {
              type: "category",
              parentType: "default",
              $expr: {
                $eq: ["$categoryId", "$$categoryId"],
              },
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 0,
              value: 1,
            },
          },
        ],
        as: "categoryPricing",
      },
    },
    ...USER_SPECIFIC_PRICING,
    {
      $addFields: {
        countryProductPricing: {
          $arrayElemAt: ["$countryProductPricing", 0],
        },
        countryCustomerGroupPricing: {
          $arrayElemAt: ["$countryCustomerGroupPricing", 0],
        },
        countryProductGroupPricing: {
          $arrayElemAt: ["$countryProductGroupPricing", 0],
        },
        countryCategoryPricing: {
          $arrayElemAt: ["$countryCategoryPricing", 0],
        },
        customerGroupPricing: {
          $arrayElemAt: ["$customerGroupPricing", 0],
        },
        productGroupPricing: {
          $arrayElemAt: ["$productGroupPricing", 0],
        },
        categoryPricing: {
          $arrayElemAt: ["$categoryPricing", 0],
        },
      },
    },
    {
      $addFields: {
        price: {
          $cond: [
            "$countryProductPricing",
            "$countryProductPricing.value",
            {
              $cond: [
                "$countryCustomerGroupPricing",
                {
                  $divide: [
                    {
                      $multiply: [
                        "$buyingPrice",
                        {
                          $add: [100, "$countryCustomerGroupPricing.value"],
                        },
                      ],
                    },
                    100,
                  ],
                },
                {
                  $cond: [
                    "$countryProductGroupPricing",
                    {
                      $divide: [
                        {
                          $multiply: [
                            "$buyingPrice",
                            {
                              $add: [100, "$countryProductGroupPricing.value"],
                            },
                          ],
                        },
                        100,
                      ],
                    },
                    {
                      $cond: [
                        "$countryCategoryPricing",
                        {
                          $divide: [
                            {
                              $multiply: [
                                "$buyingPrice",
                                {
                                  $add: [100, "$countryCategoryPricing.value"],
                                },
                              ],
                            },
                            100,
                          ],
                        },
                        {
                          $cond: [
                            "$customerGroupPricing",
                            {
                              $divide: [
                                {
                                  $multiply: [
                                    "$buyingPrice",
                                    {
                                      $add: [
                                        100,
                                        "$customerGroupPricing.value",
                                      ],
                                    },
                                  ],
                                },
                                100,
                              ],
                            },
                            {
                              $cond: [
                                "$productGroupPricing",
                                {
                                  $divide: [
                                    {
                                      $multiply: [
                                        "$buyingPrice",
                                        {
                                          $add: [
                                            100,
                                            "$productGroupPricing.value",
                                          ],
                                        },
                                      ],
                                    },
                                    100,
                                  ],
                                },
                                {
                                  $cond: [
                                    "$categoryPricing",
                                    {
                                      $divide: [
                                        {
                                          $multiply: [
                                            "$buyingPrice",
                                            {
                                              $add: [
                                                100,
                                                "$categoryPricing.value",
                                              ],
                                            },
                                          ],
                                        },
                                        100,
                                      ],
                                    },
                                    "$buyingPrice",
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "buyingPriceCurrency",
        foreignField: "_id",
        as: "currencyData",
      },
    },
    {
      $unwind: {
        path: "$currencyData",
      },
    },
    {
      $addFields: {
        price: {
          $cond: [
            {
              $eq: ["$buyingPriceCurrency", new ObjectId(currentCurrency._id)],
            },
            "$price",
            {
              $cond: [
                {
                  $eq: ["$buyingPriceCurrency", new ObjectId(usdCurrency._id)],
                },
                {
                  $round: [
                    {
                      $multiply: ["$price", currentCurrency.exchangeRate],
                    },
                    2,
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: ["$price", "$currencyData.exchangeRate"],
                        },
                        currentCurrency.exchangeRate,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  ];
};

const PRODUCT_PRICING = (countryId, userId, currentCurrency, usdCurrency) => {
  let USER_SPECIFIC_PRICING = [];

  if (userId) {
    USER_SPECIFIC_PRICING = [
      {
        type: "customerGroup",
        parentType: "country",
        $expr: {
          $eq: ["$categoryId", "$$id"],
        },
        countryId: new ObjectId(countryId),
      },
      {
        type: "customerGroup",
        parentType: "default",
        $expr: {
          $eq: ["$categoryId", "$$id"],
        },
      },
    ];
  }

  return [
    {
      $lookup: {
        from: "pricingnews",
        let: {
          id: "$categoryId",
          productId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $or: [
                ...USER_SPECIFIC_PRICING,
                {
                  type: "productGroup",
                  parentType: "country",
                  countryId: new ObjectId(countryId),
                },
                {
                  type: "productGroup",
                  parentType: "default",
                },
              ],
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "groups",
              let: {
                customerGroupId: "$customerGroupId",
                productGroupId: "$productGroupId",
                groupId: {
                  $cond: [
                    "$customerGroupId",
                    "$customerGroupId",
                    "$productGroupId",
                  ],
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$groupId"],
                    },
                    isActive: true,
                    isDeleted: false,
                    $and: [
                      {
                        $expr: {
                          $in: [
                            {
                              $cond: [
                                "$$customerGroupId",
                                new ObjectId(userId),
                                "$$productId",
                              ],
                            },
                            "$members",
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
              as: "groupData",
            },
          },
          {
            $unwind: {
              path: "$groupData",
            },
          },
          {
            $project: {
              _id: 0,
              value: 1,
              type: 1,
              parentType: 1,
            },
          },
        ],
        as: "first",
      },
    },
    {
      $lookup: {
        from: "pricingnews",
        let: {
          id: "$_id",
          categoryId: "$categoryId",
        },
        pipeline: [
          {
            $match: {
              $or: [
                {
                  type: "product",
                  parentType: "country",
                  $expr: {
                    $eq: ["$productId", "$$id"],
                  },
                  countryId: new ObjectId(countryId),
                },
                {
                  type: "category",
                  parentType: "country",
                  $expr: {
                    $eq: ["$categoryId", "$$categoryId"],
                  },
                  countryId: new ObjectId(countryId),
                },
                {
                  type: "category",
                  parentType: "default",
                  $expr: {
                    $eq: ["$categoryId", "$$categoryId"],
                  },
                },
              ],
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 0,
              value: 1,
              type: 1,
              parentType: 1,
            },
          },
        ],
        as: "second",
      },
    },
    {
      $addFields: {
        countryCustomerGroupPricing: {
          $filter: {
            input: "$first",
            as: "item",
            cond: {
              $and: [
                {
                  $eq: ["$$item.type", "customerGroup"],
                },
                {
                  $eq: ["$$item.parentType", "country"],
                },
              ],
            },
            limit: 1,
          },
        },
        customerGroupPricing: {
          $filter: {
            input: "$first",
            as: "item",
            cond: {
              $and: [
                {
                  $eq: ["$$item.type", "customerGroup"],
                },
                {
                  $eq: ["$$item.parentType", "default"],
                },
              ],
            },
            limit: 1,
          },
        },
        countryProductGroupPricing: {
          $filter: {
            input: "$first",
            as: "item",
            cond: {
              $and: [
                {
                  $eq: ["$$item.type", "productGroup"],
                },
                {
                  $eq: ["$$item.parentType", "country"],
                },
              ],
            },
            limit: 1,
          },
        },
        productGroupPricing: {
          $filter: {
            input: "$first",
            as: "item",
            cond: {
              $and: [
                {
                  $eq: ["$$item.type", "productGroup"],
                },
                {
                  $eq: ["$$item.parentType", "default"],
                },
              ],
            },
            limit: 1,
          },
        },
        countryProductPricing: {
          $filter: {
            input: "$second",
            as: "item",
            cond: {
              $and: [
                {
                  $eq: ["$$item.type", "product"],
                },
                {
                  $eq: ["$$item.parentType", "country"],
                },
              ],
            },
            limit: 1,
          },
        },
        countryCategoryPricing: {
          $filter: {
            input: "$second",
            as: "item",
            cond: {
              $and: [
                {
                  $eq: ["$$item.type", "category"],
                },
                {
                  $eq: ["$$item.parentType", "country"],
                },
              ],
            },
            limit: 1,
          },
        },
        categoryPricing: {
          $filter: {
            input: "$second",
            as: "item",
            cond: {
              $and: [
                {
                  $eq: ["$$item.type", "category"],
                },
                {
                  $eq: ["$$item.parentType", "default"],
                },
              ],
            },
            limit: 1,
          },
        },
      },
    },
    {
      $addFields: {
        countryProductPricing: {
          $arrayElemAt: ["$countryProductPricing", 0],
        },
        countryCustomerGroupPricing: {
          $arrayElemAt: ["$countryCustomerGroupPricing", 0],
        },
        countryProductGroupPricing: {
          $arrayElemAt: ["$countryProductGroupPricing", 0],
        },
        countryCategoryPricing: {
          $arrayElemAt: ["$countryCategoryPricing", 0],
        },
        customerGroupPricing: {
          $arrayElemAt: ["$customerGroupPricing", 0],
        },
        productGroupPricing: {
          $arrayElemAt: ["$productGroupPricing", 0],
        },
        categoryPricing: {
          $arrayElemAt: ["$categoryPricing", 0],
        },
      },
    },
    {
      $addFields: {
        //instead of holding a value it could be an object
        price: {
          $cond: [
            "$countryProductPricing",
            "$countryProductPricing.value",
            {
              $cond: [
                "$countryCustomerGroupPricing",
                {
                  $divide: [
                    {
                      $multiply: [
                        "$sellingPrice",
                        {
                          $add: [100, "$countryCustomerGroupPricing.value"],
                        },
                      ],
                    },
                    100,
                  ],
                },
                {
                  $cond: [
                    "$countryProductGroupPricing",
                    {
                      $divide: [
                        {
                          $multiply: [
                            "$sellingPrice",
                            {
                              $add: [100, "$countryProductGroupPricing.value"],
                            },
                          ],
                        },
                        100,
                      ],
                    },
                    {
                      $cond: [
                        "$countryCategoryPricing",
                        {
                          $divide: [
                            {
                              $multiply: [
                                "$sellingPrice",
                                {
                                  $add: [100, "$countryCategoryPricing.value"],
                                },
                              ],
                            },
                            100,
                          ],
                        },
                        {
                          $cond: [
                            "$customerGroupPricing",
                            {
                              $divide: [
                                {
                                  $multiply: [
                                    "$sellingPrice",
                                    {
                                      $add: [
                                        100,
                                        "$customerGroupPricing.value",
                                      ],
                                    },
                                  ],
                                },
                                100,
                              ],
                            },
                            {
                              $cond: [
                                "$productGroupPricing",
                                {
                                  $divide: [
                                    {
                                      $multiply: [
                                        "$sellingPrice",
                                        {
                                          $add: [
                                            100,
                                            "$productGroupPricing.value",
                                          ],
                                        },
                                      ],
                                    },
                                    100,
                                  ],
                                },
                                {
                                  $cond: [
                                    "$categoryPricing",
                                    {
                                      $divide: [
                                        {
                                          $multiply: [
                                            "$sellingPrice",
                                            {
                                              $add: [
                                                100,
                                                "$categoryPricing.value",
                                              ],
                                            },
                                          ],
                                        },
                                        100,
                                      ],
                                    },
                                    "$sellingPrice",
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        discountedPrice: {
          $cond: [
            "$countryProductPricing",
            "$countryProductPricing.value",
            {
              $cond: [
                "$countryCustomerGroupPricing",
                {
                  $divide: [
                    {
                      $multiply: [
                        "$discountedPrice",
                        {
                          $add: [100, "$countryCustomerGroupPricing.value"],
                        },
                      ],
                    },
                    100,
                  ],
                },
                {
                  $cond: [
                    "$countryProductGroupPricing",
                    {
                      $divide: [
                        {
                          $multiply: [
                            "$discountedPrice",
                            {
                              $add: [100, "$countryProductGroupPricing.value"],
                            },
                          ],
                        },
                        100,
                      ],
                    },
                    {
                      $cond: [
                        "$countryCategoryPricing",
                        {
                          $divide: [
                            {
                              $multiply: [
                                "$discountedPrice",
                                {
                                  $add: [100, "$countryCategoryPricing.value"],
                                },
                              ],
                            },
                            100,
                          ],
                        },
                        {
                          $cond: [
                            "$customerGroupPricing",
                            {
                              $divide: [
                                {
                                  $multiply: [
                                    "$discountedPrice",
                                    {
                                      $add: [
                                        100,
                                        "$customerGroupPricing.value",
                                      ],
                                    },
                                  ],
                                },
                                100,
                              ],
                            },
                            {
                              $cond: [
                                "$productGroupPricing",
                                {
                                  $divide: [
                                    {
                                      $multiply: [
                                        "$discountedPrice",
                                        {
                                          $add: [
                                            100,
                                            "$productGroupPricing.value",
                                          ],
                                        },
                                      ],
                                    },
                                    100,
                                  ],
                                },
                                {
                                  $cond: [
                                    "$categoryPricing",
                                    {
                                      $divide: [
                                        {
                                          $multiply: [
                                            "$discountedPrice",
                                            {
                                              $add: [
                                                100,
                                                "$categoryPricing.value",
                                              ],
                                            },
                                          ],
                                        },
                                        100,
                                      ],
                                    },
                                    "$discountedPrice",
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "buyingPriceCurrency",
        foreignField: "_id",
        as: "currencyData",
      },
    },
    {
      $unwind: {
        path: "$currencyData",
      },
    },
    {
      $addFields: {
        price: {
          $cond: [
            {
              $eq: ["$buyingPriceCurrency", new ObjectId(currentCurrency._id)],
            },
            "$price",
            {
              $cond: [
                {
                  $eq: ["$buyingPriceCurrency", new ObjectId(usdCurrency._id)],
                },
                {
                  $round: [
                    {
                      $multiply: ["$price", currentCurrency.exchangeRate],
                    },
                    2,
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: ["$price", "$currencyData.exchangeRate"],
                        },
                        currentCurrency.exchangeRate,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
          ],
        },
        discountedPrice: {
          $cond: [
            {
              $eq: ["$buyingPriceCurrency", new ObjectId(currentCurrency._id)],
            },
            "$discountedPrice",
            {
              $cond: [
                {
                  $eq: ["$buyingPriceCurrency", new ObjectId(usdCurrency._id)],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        "$discountedPrice",
                        currentCurrency.exchangeRate,
                      ],
                    },
                    2,
                  ],
                },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$discountedPrice",
                            "$currencyData.exchangeRate",
                          ],
                        },
                        currentCurrency.exchangeRate,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        // discountPercentage: {
        //   $round: [
        //     {
        //       $subtract: [
        //         100,
        //         {
        //           $divide: [
        //             {
        //               $multiply: ["$discountedPrice", 100],
        //             },
        //             "$price",
        //           ],
        //         },
        //       ],
        //     },
        //     2,
        //   ],
        // },
        discountPercentage: {
          $cond: [
            { $gt: ["$price", 0] },
            {
              $round: [
                {
                  $subtract: [
                    100,
                    {
                      $divide: [
                        {
                          $multiply: ["$discountedPrice", 100],
                        },
                        "$price",
                      ],
                    },
                  ],
                },
                2,
              ],
            },
            0,
          ],
        },
      },
    },
  ];
};

const REVIEW_AGG = {
  first: [
    {
      $lookup: {
        from: "reviews",
        let: {
          id: "$idForCart",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$id", "$itemId"],
              },
              status: "approved",
            },
          },
          {
            $group: {
              _id: "x50",
              ratings: {
                $sum: "$rating",
              },
              reviewsCount: {
                $push: "$_id",
              },
            },
          },
          {
            $addFields: {
              reviewsCount: {
                $size: "$reviewsCount",
              },
              ratings: {
                $round: [
                  {
                    $divide: [
                      "$ratings",
                      {
                        $size: "$reviewsCount",
                      },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ],
        as: "reviewsData",
      },
    },
    {
      $unwind: {
        path: "$reviewsData",
        preserveNullAndEmptyArrays: true,
      },
    },
  ],
  second: {
    ratings: {
      $ifNull: ["$reviewsData.ratings", 0],
    },
    reviewsCount: {
      $ifNull: ["$reviewsData.reviewsCount", 0],
    },
  },
};

const CART_CHECKOUT = (userId, countryId, currentCurrency, usdCurrency) => {
  return [
    {
      $match: {
        customerId: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "vendorproducts",
        let: {
          id: "$itemId",
          itemSubType: "$itemSubType",
          quantity: "$quantity",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              $and: [
                {
                  $expr: {
                    $eq: ["main", "$$itemSubType"],
                  },
                },
              ],
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                id: "$productId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                    isPublished: true,
                    isApproved: true,
                  },
                },
                {
                  $project: {
                    coverImage: 1,
                    categoryId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $lookup: {
              from: "vendors",
              let: {
                id: "$vendorId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    businessName: 1,
                  },
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              idForCart: "$_id",
              typeForCart: "main",
              vendorId: 1,
              sellingPrice: "$buyingPrice",
              discountedPrice: "$discountedPrice",
              buyingPriceCurrency: 1,
              name: "$langData.name",
              slug: "$langData.slug",
              quantity: "$$quantity",
              categoryId: "$productData.categoryId",
            },
          },
        ],
        as: "vendorProduct",
      },
    },
    {
      $lookup: {
        from: "vendorproductvariants",
        let: {
          id: "$itemId",
          itemSubType: "$itemSubType",
          quantity: "$quantity",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
              $and: [
                {
                  $expr: {
                    $eq: ["variant", "$$itemSubType"],
                  },
                },
              ],
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                id: "$mainProductId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                    isPublished: true,
                    isApproved: true,
                  },
                },
                {
                  $project: {
                    categoryId: 1,
                  },
                },
              ],
              as: "productData",
            },
          },
          {
            $lookup: {
              from: "vendors",
              let: {
                id: "$vendorId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                    isActive: true,
                    isDeleted: false,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    businessName: 1,
                  },
                },
              ],
              as: "vendorData",
            },
          },
          {
            $unwind: {
              path: "$productData",
            },
          },
          {
            $unwind: {
              path: "$vendorData",
            },
          },
          {
            $lookup: {
              from: "productvariants",
              let: {
                id: "$mainProductId",
                productVariantId: "$productVariantId",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$mainProductId", "$$id"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$_id", "$$productVariantId"],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$isDeleted", false],
                        },
                      },
                      {
                        $expr: {
                          $eq: ["$isActive", true],
                        },
                      },
                    ],
                  },
                },
              ],
              as: "variantData",
            },
          },
          {
            $unwind: {
              path: "$variantData",
            },
          },
          {
            $project: {
              _id: "$productData._id",
              idForCart: "$_id",
              typeForCart: "variant",
              vendorId: 1,
              sellingPrice: "$buyingPrice",
              discountedPrice: "$discountedPrice",
              buyingPriceCurrency: 1,
              quantity: "$$quantity",
              categoryId: "$productData.categoryId",
            },
          },
        ],
        as: "vendorProductVariant",
      },
    },
    {
      $addFields: {
        product: {
          $concatArrays: ["$vendorProduct", "$vendorProductVariant"],
        },
      },
    },
    {
      $unwind: {
        path: "$product",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$product",
      },
    },
    ...PRODUCT_PRICING(countryId, userId, currentCurrency, usdCurrency),
    {
      $addFields: {
        currency: { $literal: currentCurrency.sign },
        shareUrl: {
          $concat: [process.env.FRONTEND_URL, "/product/", "$slug"],
        },
        totalPrice: {
          $multiply: ["$discountedPrice", "$quantity"],
        },
      },
    },
  ];
};

module.exports = {
  SORT,
  SKIP,
  LIMIT,
  LOOKUP_USER,
  LOOKUP_CART,
  LOOKUP_ORDER,
  LOOKUP_CATEGORY,
  PRODUCT_PRICING,
  REVIEW_AGG,
  CART_CHECKOUT,
};
