class CustomResponse {
  constructor() {
    this.code = null;
    this.data = null;
  }

  status(code) {
    this.code = code;
    return this;
  }

  json(obj) {
    this.data = obj;
    return this;
  }
}

module.exports = CustomResponse;
