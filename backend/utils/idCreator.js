const Idmanager = require("../models/idManager");

const keyObj = {
  product: "NMP",
  productVariant: "NMPV",
  order: "NMO"
};

const idMaker = async (db, toChange = true) => {
  let idManager;
  let id;

  try {
    idManager = await Idmanager.findOne({ coll: db });
    if (!idManager) {
      if (toChange) {
        let newIdManager = new Idmanager({
          coll: db,
          count: 1,
        });
        await newIdManager.save();
      }
      id = `${keyObj[db]}00000001`;
    } else {
      if (toChange) {
        await Idmanager.findOneAndUpdate({ coll: db }, { $inc: { count: +1 } });
      }
      let num = idManager.count + 1;
      let len = num.toString().length;
      let str = "";
      for (let i = 1; i <= 8 - len; i++) {
        str += "0";
      }
      str += num;
      id = `${keyObj[db]}${str}`;
    }
  } catch (error) {
    console.log("err", error);
    return "err";
  }
  return id;
};

module.exports = idMaker;
