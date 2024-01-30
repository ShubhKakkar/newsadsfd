const ProductDescription = require("../models/productCategoryDescription");
const ProductCategory = require("../models/productCategory");


const enData = [
    {
        "id": "T214",
        "category_id": "214",
        "text": "TOMMY LIFE",
        "is_active": "0",
        "cls": "folder",
        "children": [
            {
                "id": "46",
                "category_id": "215",
                "text": "AYAKKABI",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "47",
                        "category_id": "226",
                        "text": "ERKEK AYAKKABI",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "946",
                                "category_id": "228",
                                "text": "Erkek Terlik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "942",
                                "category_id": "229",
                                "text": "Günlük Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "990",
                                "category_id": "230",
                                "text": "Spor Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "943",
                                "category_id": "231",
                                "text": "Yazlık Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "165",
                        "category_id": "227",
                        "text": "KADIN AYAKKABI",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1249",
                                "category_id": "232",
                                "text": "Günlük Spor Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "35",
                "category_id": "216",
                "text": "ERKEK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "869",
                        "category_id": "233",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "623",
                                "category_id": "236",
                                "text": "Büyük Beden Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1254",
                                "category_id": "237",
                                "text": "Büyük Beden Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1588",
                                "category_id": "238",
                                "text": "Deniz Şortu",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "37",
                                "category_id": "239",
                                "text": "Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "328",
                                "category_id": "240",
                                "text": "Kapri",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "314",
                                "category_id": "241",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "39",
                                "category_id": "242",
                                "text": "Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "870",
                        "category_id": "234",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "625",
                                "category_id": "243",
                                "text": "Büyük Beden Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "36",
                                "category_id": "244",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1258",
                                "category_id": "245",
                                "text": "Polar Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "150",
                                "category_id": "246",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "871",
                        "category_id": "235",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "627",
                                "category_id": "247",
                                "text": "Büyük Beden T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "5844",
                                "category_id": "248",
                                "text": "Gömlek",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "228",
                                "category_id": "249",
                                "text": "Mont",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "395",
                                "category_id": "250",
                                "text": "Polar Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1260",
                                "category_id": "251",
                                "text": "Polo Yaka Erkek T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "38",
                                "category_id": "252",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "40",
                                "category_id": "253",
                                "text": "T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "229",
                                "category_id": "254",
                                "text": "Yağmurluk",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "43",
                "category_id": "217",
                "text": "ERKEK ÇOCUK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "858",
                        "category_id": "255",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "410",
                                "category_id": "258",
                                "text": "Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "210",
                                "category_id": "259",
                                "text": "Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "315",
                                "category_id": "260",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1300",
                                "category_id": "261",
                                "text": "Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "860",
                        "category_id": "256",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "411",
                                "category_id": "262",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "309",
                                "category_id": "263",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "859",
                        "category_id": "257",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "212",
                                "category_id": "264",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "44",
                                "category_id": "265",
                                "text": "T-shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "25",
                "category_id": "218",
                "text": "KADIN",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "872",
                        "category_id": "266",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "34",
                                "category_id": "269",
                                "text": "Büyük Beden Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "914",
                                "category_id": "270",
                                "text": "Denim Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "105",
                                "category_id": "271",
                                "text": "Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "584",
                                "category_id": "272",
                                "text": "Kadın Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "30",
                                "category_id": "273",
                                "text": "Tayt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "316",
                                "category_id": "274",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "873",
                        "category_id": "267",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "32",
                                "category_id": "275",
                                "text": "Büyük Beden Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "28",
                                "category_id": "276",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "29",
                                "category_id": "277",
                                "text": "Eşofman Tunik Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "139",
                                "category_id": "278",
                                "text": "Tayt Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "630",
                                "category_id": "279",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "874",
                        "category_id": "268",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "602",
                                "category_id": "280",
                                "text": "Crop Top",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "913",
                                "category_id": "281",
                                "text": "Denim Ceket",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "408",
                                "category_id": "282",
                                "text": "Elbise",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "203",
                                "category_id": "283",
                                "text": "Spor Atlet",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "201",
                                "category_id": "284",
                                "text": "Spor Büstiyer",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "140",
                                "category_id": "285",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "202",
                                "category_id": "286",
                                "text": "T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "844",
                                "category_id": "287",
                                "text": "Triko",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "26",
                                "category_id": "288",
                                "text": "Tunik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "1327",
                "category_id": "219",
                "text": "KIZ ÇOCUK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "1329",
                        "category_id": "289",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1334",
                                "category_id": "292",
                                "text": "Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1335",
                                "category_id": "293",
                                "text": "Tayt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "1330",
                        "category_id": "290",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1336",
                                "category_id": "294",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1337",
                                "category_id": "295",
                                "text": "Tayt Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "1328",
                        "category_id": "291",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1601",
                                "category_id": "296",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1332",
                                "category_id": "297",
                                "text": "T-shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "5852",
                "category_id": "220",
                "text": "KOLEKSİYON",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "5855",
                        "category_id": "298",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "5859",
                                "category_id": "299",
                                "text": "Gömlek",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "1681",
                "category_id": "221",
                "text": "200-299 TL Arası Ürünler ",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "1577",
                "category_id": "222",
                "text": "Outlet Ürünler",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "512",
                "category_id": "223",
                "text": "TÜM ÜRÜNLER",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "21",
                "category_id": "224",
                "text": "YENİ GELENLER",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "5851",
                "category_id": "225",
                "text": "ÇOCUK",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    },
    {
        "id": "T3",
        "category_id": "81",
        "text": "Home & Kitchen",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T14",
                "category_id": "86",
                "text": "Mobile and Smartphones",
                "is_active": "0",
                "cls": "folder",
                "children": [
                    {
                        "id": "T62",
                        "category_id": "90",
                        "text": "Carpets",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T59",
                        "category_id": "87",
                        "text": "Bedroom Textiles",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T60",
                        "category_id": "88",
                        "text": "Living Room Textiles",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T61",
                        "category_id": "89",
                        "text": "Bathroom Textiles",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T35",
                "category_id": "91",
                "text": "Home Decoration",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T63",
                        "category_id": "92",
                        "text": "Lighting",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T65",
                        "category_id": "94",
                        "text": "Antiques",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T64",
                        "category_id": "93",
                        "text": "Tableau",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T13",
                "category_id": "82",
                "text": "Kitchen Equipment",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T34",
                        "category_id": "84",
                        "text": "Tableware",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T58",
                        "category_id": "85",
                        "text": "Cookware",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T33",
                        "category_id": "83",
                        "text": "Cups",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T1",
        "category_id": "60",
        "text": "Food & Drinks",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T12",
                "category_id": "76",
                "text": "Foodstuff",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T54",
                        "category_id": "77",
                        "text": "Legumes And Pasta",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T55",
                        "category_id": "78",
                        "text": "Honey And Jams",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T56",
                        "category_id": "79",
                        "text": "Spices",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T57",
                        "category_id": "80",
                        "text": "Natural Extracts",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T7",
                "category_id": "61",
                "text": "Drinks",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T18",
                        "category_id": "62",
                        "text": "Tea",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T20",
                        "category_id": "64",
                        "text": "Natural Drinks",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T19",
                        "category_id": "63",
                        "text": "Turkish Coffee",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T21",
                        "category_id": "65",
                        "text": "Hot Drinks",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T22",
                        "category_id": "66",
                        "text": "Herbal Tea",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T8",
                "category_id": "67",
                "text": "Sweets",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T23",
                        "category_id": "68",
                        "text": "Turkish Baklawa",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T24",
                        "category_id": "69",
                        "text": "Turkish Delight",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T52",
                        "category_id": "70",
                        "text": "Chocolate And Candies",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T53",
                        "category_id": "71",
                        "text": "Pastries",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T9",
                "category_id": "72",
                "text": "Dried Fruits & Snacks",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T26",
                        "category_id": "74",
                        "text": "Nuts",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T27",
                        "category_id": "75",
                        "text": "Turkish Snacks",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T25",
                        "category_id": "73",
                        "text": "Dried Fruit",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T4",
        "category_id": "95",
        "text": "Jewelry & Accessory",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T66",
                "category_id": "109",
                "text": "Bijouterie",
                "is_active": "0",
                "cls": "folder",
                "children": [
                    {
                        "id": "T67",
                        "category_id": "110",
                        "text": "Bracelet",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T68",
                        "category_id": "111",
                        "text": "Bijouterie Sets",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T15",
                "category_id": "96",
                "text": "Men's Jewelry",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T36",
                        "category_id": "97",
                        "text": "Men's Rings",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T37",
                        "category_id": "98",
                        "text": "Rosaries",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T38",
                        "category_id": "99",
                        "text": "Men's Bracelets",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T42",
                        "category_id": "100",
                        "text": "Men's Bijouterie Sets",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T116",
                        "category_id": "101",
                        "text": "Men's Accessories",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T153",
                        "category_id": "102",
                        "text": "Men's Necklaces",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T16",
                "category_id": "103",
                "text": "Women's Jewelry",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T39",
                        "category_id": "104",
                        "text": "Women's Rings",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T40",
                        "category_id": "105",
                        "text": "Necklaces",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T41",
                        "category_id": "106",
                        "text": "Women's Bracelets",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T43",
                        "category_id": "107",
                        "text": "Women's Bijouterie Sets",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T152",
                        "category_id": "108",
                        "text": "Women's Accessories",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T154",
                        "category_id": "210",
                        "text": "Women's Earrings",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T5",
        "category_id": "112",
        "text": "Health & Beauty",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T2",
                "category_id": "113",
                "text": "Tonics & Nutritional Supplements",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T31",
                        "category_id": "114",
                        "text": "Sexual Tonics",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T32",
                        "category_id": "115",
                        "text": "Immune Boosters",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T51",
                        "category_id": "116",
                        "text": "Organic Food Supplements",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T6",
                "category_id": "117",
                "text": "Hair & Skin Care Products",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T49",
                        "category_id": "118",
                        "text": "Hand & Nail Care Products",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T50",
                        "category_id": "119",
                        "text": "Skin & Face Care Products",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T69",
                        "category_id": "120",
                        "text": "Hair & Beard Care Products",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T70",
                        "category_id": "121",
                        "text": "Body Care Products",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T71",
                        "category_id": "122",
                        "text": "Sun Protection Products",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T10",
                "category_id": "123",
                "text": "Slimming Products",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T28",
                        "category_id": "124",
                        "text": "Slimming Tea",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T29",
                        "category_id": "125",
                        "text": "Slimming Cosmetics",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T11",
                "category_id": "126",
                "text": "Natural Products",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T30",
                        "category_id": "127",
                        "text": "Organic Products",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T44",
                        "category_id": "128",
                        "text": "Turkish Oils & Essences",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T17",
                "category_id": "129",
                "text": "Makeup",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T45",
                        "category_id": "130",
                        "text": "Face & Skin Makeup",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T46",
                        "category_id": "131",
                        "text": "Eye Makeup",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T47",
                        "category_id": "132",
                        "text": "Lips Makeup",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T48",
                        "category_id": "133",
                        "text": "Makeup Brushes & Accessories",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T72",
        "category_id": "134",
        "text": "Shoes & Bags",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T73",
                "category_id": "135",
                "text": "Shoes",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T77",
                        "category_id": "138",
                        "text": "Kids Shoes",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T75",
                        "category_id": "136",
                        "text": "Men Shoes",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T76",
                        "category_id": "137",
                        "text": "Women Shoes",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T74",
                "category_id": "139",
                "text": "Bags & Purses",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T78",
                        "category_id": "140",
                        "text": "For Men",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T79",
                        "category_id": "141",
                        "text": "For Women",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T80",
                        "category_id": "142",
                        "text": "Kids",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T81",
        "category_id": "143",
        "text": "Clothing",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T82",
                "category_id": "144",
                "text": "Women's Clothing",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T83",
                        "category_id": "145",
                        "text": "Dresses",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T84",
                        "category_id": "146",
                        "text": "Shirts & Blouses ",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T85",
                        "category_id": "147",
                        "text": "Jeans & Pants",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T86",
                        "category_id": "148",
                        "text": "Women's Jackets & Coats",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T87",
                        "category_id": "149",
                        "text": "Overalls & Skirt",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T88",
                        "category_id": "150",
                        "text": "Hijab Clothes",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T91",
                                "category_id": "151",
                                "text": "Tunic",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T92",
                                "category_id": "152",
                                "text": "Hijab",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T93",
                                "category_id": "153",
                                "text": "Prayer Dress",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T94",
                                "category_id": "154",
                                "text": "Cap & Topcoat",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T95",
                                "category_id": "155",
                                "text": "Evening Dress",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T89",
                        "category_id": "156",
                        "text": "Women's Sportswear",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T96",
                                "category_id": "157",
                                "text": "Sets",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T97",
                                "category_id": "158",
                                "text": "Pants & Skorts",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T98",
                                "category_id": "159",
                                "text": "Spor Shirts",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T99",
                                "category_id": "160",
                                "text": "Active Wear",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T100",
                                "category_id": "161",
                                "text": "Sports Accessories",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T90",
                        "category_id": "162",
                        "text": "Women's Underwear",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T101",
                                "category_id": "163",
                                "text": "Pajama Sets",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T102",
                                "category_id": "164",
                                "text": "Nightdresses",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T103",
                                "category_id": "165",
                                "text": "Women Bras",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T104",
                                "category_id": "166",
                                "text": "Women Panties",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T105",
                                "category_id": "167",
                                "text": "Under Wear",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T106",
                                "category_id": "168",
                                "text": "Lingerie Sets",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T107",
                                "category_id": "169",
                                "text": "Corsets",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "T108",
                "category_id": "170",
                "text": "Men's Clothing",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T109",
                        "category_id": "171",
                        "text": "Men's Suit Sets",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T110",
                        "category_id": "172",
                        "text": "Men's Jackets & Coats",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T111",
                        "category_id": "173",
                        "text": "Shirts & T-Shirts",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T112",
                        "category_id": "174",
                        "text": "Men's Pants",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T113",
                        "category_id": "175",
                        "text": "Sweatshirts & Knitwear",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T114",
                        "category_id": "176",
                        "text": "Men's Sportswear",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T115",
                        "category_id": "177",
                        "text": "Men's Underwear",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T117",
                "category_id": "178",
                "text": "Children's Wear",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T118",
                        "category_id": "179",
                        "text": "Boys Clothes",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T129",
                                "category_id": "180",
                                "text": "Boy Sweatshirts & Knitwear",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T132",
                                "category_id": "181",
                                "text": "Boy  Jackets & Coats",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T133",
                                "category_id": "182",
                                "text": "Boy  Pants",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T134",
                                "category_id": "183",
                                "text": "Boy Shirts & T-Shirts",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T135",
                                "category_id": "184",
                                "text": "Boy Suit Sets",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T136",
                                "category_id": "185",
                                "text": "Boy  Sportswear",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T137",
                                "category_id": "186",
                                "text": "Boy  Underwear",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T138",
                                "category_id": "187",
                                "text": "Boy Socks",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T119",
                        "category_id": "188",
                        "text": "Girls' Clothes",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T121",
                                "category_id": "189",
                                "text": "Girl Dresses ",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T122",
                                "category_id": "190",
                                "text": " Girls  Jackets & Coats",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T123",
                                "category_id": "191",
                                "text": " Girls Sportswear",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T124",
                                "category_id": "192",
                                "text": "Girls Jeans & Pants",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T126",
                                "category_id": "193",
                                "text": "Girl  Suit",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T127",
                                "category_id": "194",
                                "text": "Girls Overalls & Skirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T128",
                                "category_id": "195",
                                "text": "Girls Shirts & Blouses ",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T139",
                                "category_id": "196",
                                "text": "Girls Socks",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T120",
                        "category_id": "197",
                        "text": "Baby Clothes",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T140",
                                "category_id": "198",
                                "text": "Baby Set",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T141",
                                "category_id": "199",
                                "text": "Baby Jumpsuit",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T142",
                                "category_id": "200",
                                "text": "Baby Pajamas",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T143",
                                "category_id": "201",
                                "text": "Baby Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T144",
                                "category_id": "202",
                                "text": "Baby Socks",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T145",
                                "category_id": "203",
                                "text": "Baby Underwear",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T146",
                                "category_id": "204",
                                "text": "Baby Dresses",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T147",
                                "category_id": "205",
                                "text": "Baby Pants",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "T148",
        "category_id": "206",
        "text": "gifts",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T149",
                "category_id": "207",
                "text": "Men's gifts",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T150",
                "category_id": "208",
                "text": "Women's Gifts",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T151",
                "category_id": "209",
                "text": "Children's Gifts",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    },
    {
        "id": "T155",
        "category_id": "211",
        "text": "Offers",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T322",
                "category_id": "322",
                "text": "Saudi National Day Offers",
                "is_active": "0",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T321",
                "category_id": "321",
                "text": "Free Shipping Offers",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T314",
                "category_id": "314",
                "text": "5%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T315",
                "category_id": "315",
                "text": "7%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T316",
                "category_id": "316",
                "text": "15%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T317",
                "category_id": "317",
                "text": "20%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T318",
                "category_id": "318",
                "text": "30%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T320",
                "category_id": "320",
                "text": "50%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    }
]


const arData = [
    {
        "id": "T214",
        "category_id": "214",
        "text": "TOMMY LIFE",
        "is_active": "0",
        "cls": "folder",
        "children": [
            {
                "id": "46",
                "category_id": "215",
                "text": "AYAKKABI",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "47",
                        "category_id": "226",
                        "text": "ERKEK AYAKKABI",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "946",
                                "category_id": "228",
                                "text": "Erkek Terlik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "942",
                                "category_id": "229",
                                "text": "Günlük Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "990",
                                "category_id": "230",
                                "text": "Spor Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "943",
                                "category_id": "231",
                                "text": "Yazlık Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "165",
                        "category_id": "227",
                        "text": "KADIN AYAKKABI",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1249",
                                "category_id": "232",
                                "text": "Günlük Spor Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "35",
                "category_id": "216",
                "text": "ERKEK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "869",
                        "category_id": "233",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "623",
                                "category_id": "236",
                                "text": "Büyük Beden Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1254",
                                "category_id": "237",
                                "text": "Büyük Beden Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1588",
                                "category_id": "238",
                                "text": "Deniz Şortu",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "37",
                                "category_id": "239",
                                "text": "Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "328",
                                "category_id": "240",
                                "text": "Kapri",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "314",
                                "category_id": "241",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "39",
                                "category_id": "242",
                                "text": "Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "870",
                        "category_id": "234",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "625",
                                "category_id": "243",
                                "text": "Büyük Beden Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "36",
                                "category_id": "244",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1258",
                                "category_id": "245",
                                "text": "Polar Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "150",
                                "category_id": "246",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "871",
                        "category_id": "235",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "627",
                                "category_id": "247",
                                "text": "Büyük Beden T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "5844",
                                "category_id": "248",
                                "text": "Gömlek",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "228",
                                "category_id": "249",
                                "text": "Mont",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "395",
                                "category_id": "250",
                                "text": "Polar Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1260",
                                "category_id": "251",
                                "text": "Polo Yaka Erkek T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "38",
                                "category_id": "252",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "40",
                                "category_id": "253",
                                "text": "T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "229",
                                "category_id": "254",
                                "text": "Yağmurluk",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "43",
                "category_id": "217",
                "text": "ERKEK ÇOCUK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "858",
                        "category_id": "255",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "410",
                                "category_id": "258",
                                "text": "Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "210",
                                "category_id": "259",
                                "text": "Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "315",
                                "category_id": "260",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1300",
                                "category_id": "261",
                                "text": "Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "860",
                        "category_id": "256",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "411",
                                "category_id": "262",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "309",
                                "category_id": "263",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "859",
                        "category_id": "257",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "212",
                                "category_id": "264",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "44",
                                "category_id": "265",
                                "text": "T-shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "25",
                "category_id": "218",
                "text": "KADIN",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "872",
                        "category_id": "266",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "34",
                                "category_id": "269",
                                "text": "Büyük Beden Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "914",
                                "category_id": "270",
                                "text": "Denim Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "105",
                                "category_id": "271",
                                "text": "Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "584",
                                "category_id": "272",
                                "text": "Kadın Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "30",
                                "category_id": "273",
                                "text": "Tayt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "316",
                                "category_id": "274",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "873",
                        "category_id": "267",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "32",
                                "category_id": "275",
                                "text": "Büyük Beden Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "28",
                                "category_id": "276",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "29",
                                "category_id": "277",
                                "text": "Eşofman Tunik Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "139",
                                "category_id": "278",
                                "text": "Tayt Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "630",
                                "category_id": "279",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "874",
                        "category_id": "268",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "602",
                                "category_id": "280",
                                "text": "Crop Top",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "913",
                                "category_id": "281",
                                "text": "Denim Ceket",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "408",
                                "category_id": "282",
                                "text": "Elbise",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "203",
                                "category_id": "283",
                                "text": "Spor Atlet",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "201",
                                "category_id": "284",
                                "text": "Spor Büstiyer",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "140",
                                "category_id": "285",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "202",
                                "category_id": "286",
                                "text": "T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "844",
                                "category_id": "287",
                                "text": "Triko",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "26",
                                "category_id": "288",
                                "text": "Tunik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "1327",
                "category_id": "219",
                "text": "KIZ ÇOCUK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "1329",
                        "category_id": "289",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1334",
                                "category_id": "292",
                                "text": "Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1335",
                                "category_id": "293",
                                "text": "Tayt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "1330",
                        "category_id": "290",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1336",
                                "category_id": "294",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1337",
                                "category_id": "295",
                                "text": "Tayt Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "1328",
                        "category_id": "291",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1601",
                                "category_id": "296",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1332",
                                "category_id": "297",
                                "text": "T-shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "5852",
                "category_id": "220",
                "text": "KOLEKSİYON",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "5855",
                        "category_id": "298",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "5859",
                                "category_id": "299",
                                "text": "Gömlek",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "1681",
                "category_id": "221",
                "text": "200-299 TL Arası Ürünler ",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "1577",
                "category_id": "222",
                "text": "Outlet Ürünler",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "512",
                "category_id": "223",
                "text": "TÜM ÜRÜNLER",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "21",
                "category_id": "224",
                "text": "YENİ GELENLER",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "5851",
                "category_id": "225",
                "text": "ÇOCUK",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    },
    {
        "id": "T3",
        "category_id": "81",
        "text": "المنزل والمطبخ",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T14",
                "category_id": "86",
                "text": "المنسوجات المنزلية",
                "is_active": "0",
                "cls": "folder",
                "children": [
                    {
                        "id": "T62",
                        "category_id": "90",
                        "text": "السجاد",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T59",
                        "category_id": "87",
                        "text": "منسوجات غرفة النوم",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T60",
                        "category_id": "88",
                        "text": "منسوجات غرفة الجلوس",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T61",
                        "category_id": "89",
                        "text": "منسوجات الحمام",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T35",
                "category_id": "91",
                "text": "ديكور المنزل",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T63",
                        "category_id": "92",
                        "text": "الإنارة",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T65",
                        "category_id": "94",
                        "text": "تراثيات",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T64",
                        "category_id": "93",
                        "text": "اللوحات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T13",
                "category_id": "82",
                "text": "أدوات المطبخ",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T34",
                        "category_id": "84",
                        "text": "أدوات المائدة",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T58",
                        "category_id": "85",
                        "text": "أدوات الطهي",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T33",
                        "category_id": "83",
                        "text": "الأكواب والفناجين",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T1",
        "category_id": "60",
        "text": "المواد الغذائية والمشروبات",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T12",
                "category_id": "76",
                "text": "الغذائيات",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T54",
                        "category_id": "77",
                        "text": "البقوليات والمعكرونة",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T55",
                        "category_id": "78",
                        "text": "العسل والمربيات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T56",
                        "category_id": "79",
                        "text": "البهارات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T57",
                        "category_id": "80",
                        "text": "مستخلصات طبيعية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T7",
                "category_id": "61",
                "text": "المشروبات",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T18",
                        "category_id": "62",
                        "text": "الشاي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T20",
                        "category_id": "64",
                        "text": "المشروبات الطبيعية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T19",
                        "category_id": "63",
                        "text": "قهوة تركية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T21",
                        "category_id": "65",
                        "text": "المشروبات الساخنة",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T22",
                        "category_id": "66",
                        "text": "شاي الأعشاب",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T8",
                "category_id": "67",
                "text": "الحلويات",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T23",
                        "category_id": "68",
                        "text": "البقلاوة التركية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T24",
                        "category_id": "69",
                        "text": "حلقوم وراحة تركية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T52",
                        "category_id": "70",
                        "text": "الشوكولا والسكاكر",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T53",
                        "category_id": "71",
                        "text": "المعجنات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T9",
                "category_id": "72",
                "text": "فواكة مجففة ومقرمشات",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T26",
                        "category_id": "74",
                        "text": "المكسرات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T27",
                        "category_id": "75",
                        "text": "مقرمشات تركية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T25",
                        "category_id": "73",
                        "text": "فواكة مجففة",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T4",
        "category_id": "95",
        "text": "المجوهرات والإكسسوار",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T66",
                "category_id": "109",
                "text": "الإكسسوارات",
                "is_active": "0",
                "cls": "folder",
                "children": [
                    {
                        "id": "T67",
                        "category_id": "110",
                        "text": "الأساور",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T68",
                        "category_id": "111",
                        "text": "أطقم الإكسسوار",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T15",
                "category_id": "96",
                "text": "المجوهرات الرجالية",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T36",
                        "category_id": "97",
                        "text": "خواتم رجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T37",
                        "category_id": "98",
                        "text": "السبحات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T38",
                        "category_id": "99",
                        "text": "الأساور الرجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T42",
                        "category_id": "100",
                        "text": "أطقم إكسسوارات رجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T116",
                        "category_id": "101",
                        "text": "إكسسوار رجالي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T153",
                        "category_id": "102",
                        "text": "قلائد رجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T16",
                "category_id": "103",
                "text": "المجوهرات النسائية",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T39",
                        "category_id": "104",
                        "text": "خواتم نسائية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T40",
                        "category_id": "105",
                        "text": "القلائد",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T41",
                        "category_id": "106",
                        "text": "الأساور النسائية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T43",
                        "category_id": "107",
                        "text": "أطقم إكسسوارات نسائية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T152",
                        "category_id": "108",
                        "text": "إكسسوار نسائي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T154",
                        "category_id": "210",
                        "text": "أقراط نسائية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T5",
        "category_id": "112",
        "text": "الصحة والجمال",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T2",
                "category_id": "113",
                "text": "المقويات والمكملات الغذائية",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T31",
                        "category_id": "114",
                        "text": "المقويات الجنسية",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T32",
                        "category_id": "115",
                        "text": "معززات المناعة",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T51",
                        "category_id": "116",
                        "text": "المكملات الغذائية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T6",
                "category_id": "117",
                "text": "منتجات العناية بالشعر والبشرة",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T49",
                        "category_id": "118",
                        "text": "منتجات العناية باليدين والأظافر",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T50",
                        "category_id": "119",
                        "text": "منتجات العناية بالبشرة والوجه",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T69",
                        "category_id": "120",
                        "text": "منتجات العناية بالشعر واللحية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T70",
                        "category_id": "121",
                        "text": "منتجات العناية بالجسم",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T71",
                        "category_id": "122",
                        "text": "مستحضرات الوقاية من الشمس",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T10",
                "category_id": "123",
                "text": "التحكم بالوزن",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T28",
                        "category_id": "124",
                        "text": "شاي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T29",
                        "category_id": "125",
                        "text": "مستحضرات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T11",
                "category_id": "126",
                "text": "المنتجات الطبيعية",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T30",
                        "category_id": "127",
                        "text": "المنتجات العضوية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T44",
                        "category_id": "128",
                        "text": "الزيوت والمستخلصات",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T17",
                "category_id": "129",
                "text": "المكياج",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T45",
                        "category_id": "130",
                        "text": "مكياج الوجه والبشرة",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T46",
                        "category_id": "131",
                        "text": "مكياج العيون",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T47",
                        "category_id": "132",
                        "text": "مكياج الشفاه",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T48",
                        "category_id": "133",
                        "text": "فراشي واكسسوارات المكياج",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T72",
        "category_id": "134",
        "text": "الأحذية والحقائب",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T73",
                "category_id": "135",
                "text": "الأحذية",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T77",
                        "category_id": "138",
                        "text": "أحذية الأطفال",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T75",
                        "category_id": "136",
                        "text": "أحذية رجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T76",
                        "category_id": "137",
                        "text": "أحذية نسائية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T74",
                "category_id": "139",
                "text": "الحقائب والمحافظ",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T78",
                        "category_id": "140",
                        "text": "رجالي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T79",
                        "category_id": "141",
                        "text": "نسائي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T80",
                        "category_id": "142",
                        "text": "أطفال",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T81",
        "category_id": "143",
        "text": "الملابس",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T82",
                "category_id": "144",
                "text": "الملابس النسائية",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T83",
                        "category_id": "145",
                        "text": "الفساتين",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T84",
                        "category_id": "146",
                        "text": "  تيشرتات وبلايز ",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T85",
                        "category_id": "147",
                        "text": "الجينزات والبنطال",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T86",
                        "category_id": "148",
                        "text": "جاكيتات ومعاطف نسائية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T87",
                        "category_id": "149",
                        "text": "أفرول وتنانير",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T88",
                        "category_id": "150",
                        "text": "ملابس المحجبات",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T91",
                                "category_id": "151",
                                "text": "تونيك",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T92",
                                "category_id": "152",
                                "text": "الحجابات",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T93",
                                "category_id": "153",
                                "text": "ملابس الصلاة",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T94",
                                "category_id": "154",
                                "text": "كاب وعبابات",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T95",
                                "category_id": "155",
                                "text": "فساتين السهرة",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T89",
                        "category_id": "156",
                        "text": "الملابس الرياضية النسائية",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T96",
                                "category_id": "157",
                                "text": "بدلات رياضة",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T97",
                                "category_id": "158",
                                "text": "بنطال وشورت",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T98",
                                "category_id": "159",
                                "text": "قميص رياضي",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T99",
                                "category_id": "160",
                                "text": "ملابس الأنشطة الرياضية",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T100",
                                "category_id": "161",
                                "text": "ملاحقات رياضية",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T90",
                        "category_id": "162",
                        "text": "الملابس الداخلية النسائية",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T101",
                                "category_id": "163",
                                "text": "بيجامات النوم",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T102",
                                "category_id": "164",
                                "text": "فساتين النوم",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T103",
                                "category_id": "165",
                                "text": "حمالات الصدر",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T104",
                                "category_id": "166",
                                "text": "سراويل داخلية",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T105",
                                "category_id": "167",
                                "text": "قمصان داخلية",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T106",
                                "category_id": "168",
                                "text": "أطقم داخلية",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T107",
                                "category_id": "169",
                                "text": "كورسيهات",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "T108",
                "category_id": "170",
                "text": "الألبسة الرجالية",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T109",
                        "category_id": "171",
                        "text": "أطقم رجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T110",
                        "category_id": "172",
                        "text": "جاكيتات ومعاطف رجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T111",
                        "category_id": "173",
                        "text": "قميص رجالي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T112",
                        "category_id": "174",
                        "text": "بنطال رجالي",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T113",
                        "category_id": "175",
                        "text": "كنزات رجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T114",
                        "category_id": "176",
                        "text": "الملابس الرياضية الرجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T115",
                        "category_id": "177",
                        "text": "الملابس الداخلية الرجالية",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T117",
                "category_id": "178",
                "text": "ألبسة الأطفال ",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T118",
                        "category_id": "179",
                        "text": "ألبسة الفتيان",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T129",
                                "category_id": "180",
                                "text": "كنزات للصبيان",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T132",
                                "category_id": "181",
                                "text": " جاكيتات ومعاطف للصبيان",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T133",
                                "category_id": "182",
                                "text": "بنطال صبياني",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T134",
                                "category_id": "183",
                                "text": "قميص و بلوزة صبياني",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T135",
                                "category_id": "184",
                                "text": "طقم صبياني ",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T136",
                                "category_id": "185",
                                "text": "الملابس الرياضية للصبيان",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T137",
                                "category_id": "186",
                                "text": "الملابس الداخلية للصبيان",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T138",
                                "category_id": "187",
                                "text": "جوارب صبياني ",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T119",
                        "category_id": "188",
                        "text": "ألبسة الفتيات",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T121",
                                "category_id": "189",
                                "text": "فساتين بناتي",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T122",
                                "category_id": "190",
                                "text": "جاكيتات ومعاطف بناتي",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T123",
                                "category_id": "191",
                                "text": "الملابس الرياضية للبنات",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T124",
                                "category_id": "192",
                                "text": "جينزات وبنطال بناتي",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T126",
                                "category_id": "193",
                                "text": "طقم بنات",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T127",
                                "category_id": "194",
                                "text": "أفرول وتنانير بناتي",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T128",
                                "category_id": "195",
                                "text": " تيشرتات وبلايز بناتي",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T139",
                                "category_id": "196",
                                "text": "جوارب بناتي",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T120",
                        "category_id": "197",
                        "text": "ألبسة الرضع",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T140",
                                "category_id": "198",
                                "text": "طقم رضع",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T141",
                                "category_id": "199",
                                "text": "افرول رضع",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T142",
                                "category_id": "200",
                                "text": "بيجامة رضع",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T143",
                                "category_id": "201",
                                "text": "قميص وبلوزة رضع",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T144",
                                "category_id": "202",
                                "text": "جوارب رضع ",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T145",
                                "category_id": "203",
                                "text": "البسة داخلية للرضع",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T146",
                                "category_id": "204",
                                "text": "فساتين رضع",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T147",
                                "category_id": "205",
                                "text": "بنطال رضع",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "T148",
        "category_id": "206",
        "text": "الهدايا",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T149",
                "category_id": "207",
                "text": "هدايا رجالية",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T150",
                "category_id": "208",
                "text": "هدايا نسائية",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T151",
                "category_id": "209",
                "text": "هدايا الأطفال",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    },
    {
        "id": "T155",
        "category_id": "211",
        "text": "العروض ",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T322",
                "category_id": "322",
                "text": "عروض اليوم الوطني السعودي",
                "is_active": "0",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T321",
                "category_id": "321",
                "text": "عروض الشحن المجاني",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T314",
                "category_id": "314",
                "text": "5%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T315",
                "category_id": "315",
                "text": "7%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T316",
                "category_id": "316",
                "text": "15%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T317",
                "category_id": "317",
                "text": "20%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T318",
                "category_id": "318",
                "text": "30%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T320",
                "category_id": "320",
                "text": "50%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    }
];

const trData = [
    {
        "id": "T214",
        "category_id": "214",
        "text": "TOMMY LIFE",
        "is_active": "0",
        "cls": "folder",
        "children": [
            {
                "id": "46",
                "category_id": "215",
                "text": "AYAKKABI",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "47",
                        "category_id": "226",
                        "text": "ERKEK AYAKKABI",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "946",
                                "category_id": "228",
                                "text": "Erkek Terlik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "942",
                                "category_id": "229",
                                "text": "Günlük Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "990",
                                "category_id": "230",
                                "text": "Spor Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "943",
                                "category_id": "231",
                                "text": "Yazlık Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "165",
                        "category_id": "227",
                        "text": "KADIN AYAKKABI",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1249",
                                "category_id": "232",
                                "text": "Günlük Spor Ayakkabı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "35",
                "category_id": "216",
                "text": "ERKEK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "869",
                        "category_id": "233",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "623",
                                "category_id": "236",
                                "text": "Büyük Beden Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1254",
                                "category_id": "237",
                                "text": "Büyük Beden Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1588",
                                "category_id": "238",
                                "text": "Deniz Şortu",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "37",
                                "category_id": "239",
                                "text": "Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "328",
                                "category_id": "240",
                                "text": "Kapri",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "314",
                                "category_id": "241",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "39",
                                "category_id": "242",
                                "text": "Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "870",
                        "category_id": "234",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "625",
                                "category_id": "243",
                                "text": "Büyük Beden Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "36",
                                "category_id": "244",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1258",
                                "category_id": "245",
                                "text": "Polar Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "150",
                                "category_id": "246",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "871",
                        "category_id": "235",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "627",
                                "category_id": "247",
                                "text": "Büyük Beden T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "5844",
                                "category_id": "248",
                                "text": "Gömlek",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "228",
                                "category_id": "249",
                                "text": "Mont",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "395",
                                "category_id": "250",
                                "text": "Polar Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1260",
                                "category_id": "251",
                                "text": "Polo Yaka Erkek T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "38",
                                "category_id": "252",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "40",
                                "category_id": "253",
                                "text": "T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "229",
                                "category_id": "254",
                                "text": "Yağmurluk",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "43",
                "category_id": "217",
                "text": "ERKEK ÇOCUK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "858",
                        "category_id": "255",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "410",
                                "category_id": "258",
                                "text": "Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "210",
                                "category_id": "259",
                                "text": "Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "315",
                                "category_id": "260",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1300",
                                "category_id": "261",
                                "text": "Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "860",
                        "category_id": "256",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "411",
                                "category_id": "262",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "309",
                                "category_id": "263",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "859",
                        "category_id": "257",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "212",
                                "category_id": "264",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "44",
                                "category_id": "265",
                                "text": "T-shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "25",
                "category_id": "218",
                "text": "KADIN",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "872",
                        "category_id": "266",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "34",
                                "category_id": "269",
                                "text": "Büyük Beden Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "914",
                                "category_id": "270",
                                "text": "Denim Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "105",
                                "category_id": "271",
                                "text": "Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "584",
                                "category_id": "272",
                                "text": "Kadın Şort",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "30",
                                "category_id": "273",
                                "text": "Tayt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "316",
                                "category_id": "274",
                                "text": "Çorap",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "873",
                        "category_id": "267",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "32",
                                "category_id": "275",
                                "text": "Büyük Beden Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "28",
                                "category_id": "276",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "29",
                                "category_id": "277",
                                "text": "Eşofman Tunik Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "139",
                                "category_id": "278",
                                "text": "Tayt Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "630",
                                "category_id": "279",
                                "text": "Şort Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "874",
                        "category_id": "268",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "602",
                                "category_id": "280",
                                "text": "Crop Top",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "913",
                                "category_id": "281",
                                "text": "Denim Ceket",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "408",
                                "category_id": "282",
                                "text": "Elbise",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "203",
                                "category_id": "283",
                                "text": "Spor Atlet",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "201",
                                "category_id": "284",
                                "text": "Spor Büstiyer",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "140",
                                "category_id": "285",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "202",
                                "category_id": "286",
                                "text": "T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "844",
                                "category_id": "287",
                                "text": "Triko",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "26",
                                "category_id": "288",
                                "text": "Tunik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "1327",
                "category_id": "219",
                "text": "KIZ ÇOCUK",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "1329",
                        "category_id": "289",
                        "text": "ALT GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1334",
                                "category_id": "292",
                                "text": "Eşofman Alt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1335",
                                "category_id": "293",
                                "text": "Tayt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "1330",
                        "category_id": "290",
                        "text": "TAKIM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1336",
                                "category_id": "294",
                                "text": "Eşofman Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1337",
                                "category_id": "295",
                                "text": "Tayt Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "1328",
                        "category_id": "291",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "1601",
                                "category_id": "296",
                                "text": "Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "1332",
                                "category_id": "297",
                                "text": "T-shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "5852",
                "category_id": "220",
                "text": "KOLEKSİYON",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "5855",
                        "category_id": "298",
                        "text": "ÜST GİYİM",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "5859",
                                "category_id": "299",
                                "text": "Gömlek",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "1681",
                "category_id": "221",
                "text": "200-299 TL Arası Ürünler ",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "1577",
                "category_id": "222",
                "text": "Outlet Ürünler",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "512",
                "category_id": "223",
                "text": "TÜM ÜRÜNLER",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "21",
                "category_id": "224",
                "text": "YENİ GELENLER",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "5851",
                "category_id": "225",
                "text": "ÇOCUK",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    },
    {
        "id": "T3",
        "category_id": "81",
        "text": "Ev Ve Mutfak",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T14",
                "category_id": "86",
                "text": "Ev Textil",
                "is_active": "0",
                "cls": "folder",
                "children": [
                    {
                        "id": "T62",
                        "category_id": "90",
                        "text": "Halılar",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T59",
                        "category_id": "87",
                        "text": "Yatak Odası Tekstili",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T60",
                        "category_id": "88",
                        "text": "Salon Tekstili",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T61",
                        "category_id": "89",
                        "text": "Banyo Tekstili",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T35",
                "category_id": "91",
                "text": "Ev Dekorasyonu",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T63",
                        "category_id": "92",
                        "text": "Aydınlatma",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T65",
                        "category_id": "94",
                        "text": "Antika",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T64",
                        "category_id": "93",
                        "text": "Tablolar",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T13",
                "category_id": "82",
                "text": "Mutfak Ürünleri",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T34",
                        "category_id": "84",
                        "text": "Sofra Takımları",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T58",
                        "category_id": "85",
                        "text": "Pişirme Gereçleri",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T33",
                        "category_id": "83",
                        "text": "Bardak ve Fincan",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T1",
        "category_id": "60",
        "text": "Yiyecek Ve İçecekler",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T12",
                "category_id": "76",
                "text": "Gıda",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T54",
                        "category_id": "77",
                        "text": "Bakliyet Ve Makarna",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T55",
                        "category_id": "78",
                        "text": "Bal Ve Reçel",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T56",
                        "category_id": "79",
                        "text": "Baharat",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T57",
                        "category_id": "80",
                        "text": "Doğal Özler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T7",
                "category_id": "61",
                "text": "İçecekler",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T18",
                        "category_id": "62",
                        "text": "Çay",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T20",
                        "category_id": "64",
                        "text": "Doğal İçecekler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T19",
                        "category_id": "63",
                        "text": "Türk Kahvesi",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T21",
                        "category_id": "65",
                        "text": "Sıcak İçecekler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T22",
                        "category_id": "66",
                        "text": "Bitki Çayı",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T8",
                "category_id": "67",
                "text": "Tatlılar",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T23",
                        "category_id": "68",
                        "text": "Baklava",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T24",
                        "category_id": "69",
                        "text": "Lokum",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T52",
                        "category_id": "70",
                        "text": "Çikolata Ve Şekerler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T53",
                        "category_id": "71",
                        "text": "Unlu Mamüller",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T9",
                "category_id": "72",
                "text": "Kuruyemiş ve Atıştırmalık",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T26",
                        "category_id": "74",
                        "text": "Kuruyemiş",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T27",
                        "category_id": "75",
                        "text": "Atıştırmalık",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T25",
                        "category_id": "73",
                        "text": "Kurutulmuş Meyve",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T4",
        "category_id": "95",
        "text": "Takı Ve Aksesuar",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T66",
                "category_id": "109",
                "text": "Bijuteri",
                "is_active": "0",
                "cls": "folder",
                "children": [
                    {
                        "id": "T67",
                        "category_id": "110",
                        "text": "Bileklik",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T68",
                        "category_id": "111",
                        "text": "Bijuteri Setleri",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T15",
                "category_id": "96",
                "text": "Erkek Takıları",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T36",
                        "category_id": "97",
                        "text": "Erkek Yüzükler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T37",
                        "category_id": "98",
                        "text": "Tespihler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T38",
                        "category_id": "99",
                        "text": "Erkek Bileklikler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T42",
                        "category_id": "100",
                        "text": "Erkek Bijuteri Setleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T116",
                        "category_id": "101",
                        "text": "Erkek Aksesuar",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T153",
                        "category_id": "102",
                        "text": "Erkek Kolyeler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T16",
                "category_id": "103",
                "text": "Kadın Takıları",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T39",
                        "category_id": "104",
                        "text": "Kadın Yüzükleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T40",
                        "category_id": "105",
                        "text": "Kolyeler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T41",
                        "category_id": "106",
                        "text": "Kadın Bilezikler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T43",
                        "category_id": "107",
                        "text": "Kadın Bijuteri Setleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T152",
                        "category_id": "108",
                        "text": "Kadın Aksesuar",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T154",
                        "category_id": "210",
                        "text": "Kadın Küpeleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T5",
        "category_id": "112",
        "text": "Sağlık ve Güzellik",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T2",
                "category_id": "113",
                "text": "Macunlar ve Gıda Takviyeleri",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T31",
                        "category_id": "114",
                        "text": "Macunlar",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T32",
                        "category_id": "115",
                        "text": "Bağışıklık Arttırıcılar",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T51",
                        "category_id": "116",
                        "text": "Gıda Takviyeleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T6",
                "category_id": "117",
                "text": "Saç ve Cilt Bakım Ürünleri",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T49",
                        "category_id": "118",
                        "text": "El Ve Tırnak Bakım Ürünleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T50",
                        "category_id": "119",
                        "text": "Cilt Ve Yüz Bakım Ürünleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T69",
                        "category_id": "120",
                        "text": "Saç Ve Sakal Bakım Ürünleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T70",
                        "category_id": "121",
                        "text": "Vücut Bakım Ürünleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T71",
                        "category_id": "122",
                        "text": "Güneş Koruma Ürünleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T10",
                "category_id": "123",
                "text": "Zayıflama Ürünleri",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T28",
                        "category_id": "124",
                        "text": "Zayıflama Çayı",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T29",
                        "category_id": "125",
                        "text": "Zayıflama Kozmetikleri",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T11",
                "category_id": "126",
                "text": "Doğal Ürünler",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T30",
                        "category_id": "127",
                        "text": "Organik Ürünler",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T44",
                        "category_id": "128",
                        "text": "Türk Yağları ve Esansları",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T17",
                "category_id": "129",
                "text": "Makyaj",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T45",
                        "category_id": "130",
                        "text": "Yüz Ve Cilt Makyajı",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T46",
                        "category_id": "131",
                        "text": "Göz Makyajı",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T47",
                        "category_id": "132",
                        "text": "Dudak Makyajı",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T48",
                        "category_id": "133",
                        "text": "Makyaj Fırçaları Ve Aksesuarları",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T72",
        "category_id": "134",
        "text": "Ayakkabı ve Çanta",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T73",
                "category_id": "135",
                "text": "Ayakkabı",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T77",
                        "category_id": "138",
                        "text": "Çocuk Ayakkabıları",
                        "is_active": "0",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T75",
                        "category_id": "136",
                        "text": "Erkek Ayakkabıları",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T76",
                        "category_id": "137",
                        "text": "Kadın Ayakkabısı",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T74",
                "category_id": "139",
                "text": "Çantalar ve Cüzdanlar",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T78",
                        "category_id": "140",
                        "text": "Erkekler İçin",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T79",
                        "category_id": "141",
                        "text": "Kadınlar İçin",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T80",
                        "category_id": "142",
                        "text": "Çocuklar",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            }
        ]
    },
    {
        "id": "T81",
        "category_id": "143",
        "text": "Giyim",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T82",
                "category_id": "144",
                "text": "Kadın Giyim",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T83",
                        "category_id": "145",
                        "text": "Elbise",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T84",
                        "category_id": "146",
                        "text": "T-Shirt & Bluz",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T85",
                        "category_id": "147",
                        "text": "Kot & Pantolon",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T86",
                        "category_id": "148",
                        "text": "Kadın Ceketleri Ve Montları",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T87",
                        "category_id": "149",
                        "text": "Tulum & Etek",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T88",
                        "category_id": "150",
                        "text": "Tesettür Giyim",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T91",
                                "category_id": "151",
                                "text": "Tunik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T92",
                                "category_id": "152",
                                "text": "Başörtüsü",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T93",
                                "category_id": "153",
                                "text": "Namaz Elbisesi",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T94",
                                "category_id": "154",
                                "text": "Kap & Pardesü",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T95",
                                "category_id": "155",
                                "text": "Abiye",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T89",
                        "category_id": "156",
                        "text": "Kadın Spor Giyim",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T96",
                                "category_id": "157",
                                "text": "Eşofman Takımı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T97",
                                "category_id": "158",
                                "text": "Eşofman Altı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T98",
                                "category_id": "159",
                                "text": "Eşofman Üstü",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T99",
                                "category_id": "160",
                                "text": "Spor Tayt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T100",
                                "category_id": "161",
                                "text": "Spor Aksesuarları",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T90",
                        "category_id": "162",
                        "text": "Kadın İç Giyim",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T101",
                                "category_id": "163",
                                "text": "Pijama Takımı",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T102",
                                "category_id": "164",
                                "text": "Gecelik",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T103",
                                "category_id": "165",
                                "text": "Sütyen",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T104",
                                "category_id": "166",
                                "text": "Külot",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T105",
                                "category_id": "167",
                                "text": "Atlet",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T106",
                                "category_id": "168",
                                "text": "İç Çamaşır Takımları",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T107",
                                "category_id": "169",
                                "text": "Korse",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            },
            {
                "id": "T108",
                "category_id": "170",
                "text": "Erkek Giyim",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T109",
                        "category_id": "171",
                        "text": "Takım Elbise",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T110",
                        "category_id": "172",
                        "text": "Erkek Ceketleri Ve Montları",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T111",
                        "category_id": "173",
                        "text": "Gömlek & T-Shirt",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T112",
                        "category_id": "174",
                        "text": "Pantolon",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T113",
                        "category_id": "175",
                        "text": "Sweatshirt & Triko",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T114",
                        "category_id": "176",
                        "text": "Erkek Spor Giyim",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    },
                    {
                        "id": "T115",
                        "category_id": "177",
                        "text": "Erkek İç Giyim",
                        "is_active": "1",
                        "cls": "file",
                        "leaf": true,
                        "checked": false
                    }
                ]
            },
            {
                "id": "T117",
                "category_id": "178",
                "text": "Çocuk Giyim",
                "is_active": "1",
                "cls": "folder",
                "children": [
                    {
                        "id": "T118",
                        "category_id": "179",
                        "text": "Erkek Çocuk",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T129",
                                "category_id": "180",
                                "text": "Erkek Çocuk Sweatshirt & Triko",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T132",
                                "category_id": "181",
                                "text": "Erkek ÇocukMont ve Kaban",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T133",
                                "category_id": "182",
                                "text": "Erkek Çocuk Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T134",
                                "category_id": "183",
                                "text": "Erkek Çocuk Gömlek & T-Shirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T135",
                                "category_id": "184",
                                "text": "Erkek Çocuk Takım",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T136",
                                "category_id": "185",
                                "text": "Erkek Çocuk Spor Giyim",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T137",
                                "category_id": "186",
                                "text": "Erkek Çocuk iç Giyim",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T138",
                                "category_id": "187",
                                "text": "erkek çocuk çorapları",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T119",
                        "category_id": "188",
                        "text": "Kız Çocuk",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T121",
                                "category_id": "189",
                                "text": "Elbiseleri",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T122",
                                "category_id": "190",
                                "text": "Mont, Kaban ve Yağmurluk",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T123",
                                "category_id": "191",
                                "text": "kız Spor Giyim",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T124",
                                "category_id": "192",
                                "text": "kız Kot & Pantolon",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T126",
                                "category_id": "193",
                                "text": "kız takımler",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T127",
                                "category_id": "194",
                                "text": "Kız Tulum & Etek",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T128",
                                "category_id": "195",
                                "text": "kız T-Shirt & Bluz",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T139",
                                "category_id": "196",
                                "text": "kız çorapları",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    },
                    {
                        "id": "T120",
                        "category_id": "197",
                        "text": "Bebek Giyim",
                        "is_active": "1",
                        "cls": "folder",
                        "children": [
                            {
                                "id": "T140",
                                "category_id": "198",
                                "text": "Bebek Seti",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T141",
                                "category_id": "199",
                                "text": "Bebek Tulum",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T142",
                                "category_id": "200",
                                "text": "Bebek Pijamaları",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T143",
                                "category_id": "201",
                                "text": "Bebek Gömleği Ve Sweatshirt",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T144",
                                "category_id": "202",
                                "text": "Bebek Çorapları",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T145",
                                "category_id": "203",
                                "text": "Bebek İç Giyim",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T146",
                                "category_id": "204",
                                "text": "Bebek Elbiseleri",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            },
                            {
                                "id": "T147",
                                "category_id": "205",
                                "text": "Bebek Pantolonu",
                                "is_active": "1",
                                "cls": "file",
                                "leaf": true,
                                "checked": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "id": "T148",
        "category_id": "206",
        "text": "Hediyeler",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T149",
                "category_id": "207",
                "text": "erkek hediyeleri",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T150",
                "category_id": "208",
                "text": "Kadın Hediyeleri",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T151",
                "category_id": "209",
                "text": "Çocuk Hediyeleri",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    },
    {
        "id": "T155",
        "category_id": "211",
        "text": "Kampanyalar",
        "is_active": "1",
        "cls": "folder",
        "children": [
            {
                "id": "T322",
                "category_id": "322",
                "text": "Suudi arbistan Bağımsızlık Günü",
                "is_active": "0",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T321",
                "category_id": "321",
                "text": "Ücretsiz kargo Kampanyaları",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T314",
                "category_id": "314",
                "text": "5%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T315",
                "category_id": "315",
                "text": "7%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T316",
                "category_id": "316",
                "text": "15%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T317",
                "category_id": "317",
                "text": "20%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T318",
                "category_id": "318",
                "text": "30%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            },
            {
                "id": "T320",
                "category_id": "320",
                "text": "50%",
                "is_active": "1",
                "cls": "file",
                "leaf": true,
                "checked": false
            }
        ]
    }
];

const updateProductDescriptionsRecursive = async (data, parentCategoryId = null, languageCode) => {
    try {
        await Promise.all(data.map(async (item) => {
            try {
                const category = await ProductCategory.findOne({ categoryId: item.category_id });

                if (category) {
                    const FoundProductDescription = await ProductDescription.findOne({
                        productCategoryId: category._id,
                        languageCode: languageCode
                    })
                    if (!FoundProductDescription) {
                        const newData = new ProductDescription({
                            productCategoryId: category._id,
                            languageCode: languageCode,
                            name: item.text,
                            slug: item.text + Math.random().toString(36).substr(2, 9),
                        });
                        await newData.save();
                        if (item.children && item.children.length > 0) {
                            await updateProductDescriptionsRecursive(item.children, category._id, languageCode);
                        }
                    }
                }
            } catch (error) {
                console.error('Error updating ProductDescriptions for category:', item.category_id, error);
            }
        }));
    } catch (error) {
        console.error('Error updating ProductDescriptions:', error);
    }
};

const updateProductDescriptions = async () => {
    try {
        await updateProductDescriptionsRecursive(enData, null, "en");
        await updateProductDescriptionsRecursive(arData, null, "ar");
        await updateProductDescriptionsRecursive(trData, null, "tr");
    } catch (error) {
        console.error('Error updating ProductDescriptions:', error);
    }
};

module.exports = {
    updateProductDescriptions: updateProductDescriptions
}

