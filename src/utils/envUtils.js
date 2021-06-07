export const EnvParse = {
  envInt: function (value) {
    return parseInt(value, 10);
  },

  envJSON: function (value) {
    return JSON.parse(value);
  },

  envBool: function (value) {
    if (value === undefined) {
      return false;
    }
    if (['1', 'true', 'yes', 'on'].includes(value.toLowerCase())) {
      return true;
    }
    if (['0', 'false', 'no', 'off'].includes(value.toLowerCase())) {
      return false;
    }
    throw new Error(`Not a boolean: ${value}`);
  }
};
