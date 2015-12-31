'use strict';

var constx = {
  argumentSchema: {
    "type": "object",
    "oneOf": [{
      "properties": {
        "type": {
          "type": "string",
          "enum": ["error"]
        },
        "message": {
          "type": "string"
        }
      }
    }, {
      "properties": {
        "state": {
          "type": "string"
        },
        "type": {
          "type": "string",
          "enum": ["result"]
        },
        "message": {
          "type": "string"
        },
        "details": {
          "type": "array",
          "items": {
            "oneOf": [{
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["json"]
                },
                "data": {
                  "type": "object"
                }
              },
              "required": ["type", "data"]
            }, {
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["record", "object"]
                },
                "label": {
                  "type": "object"
                },
                "data": {
                  "type": "object"
                }
              },
              "required": ["type", "label", "data"]
            }, {
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["table", "grid"]
                },
                "label": {
                  "type": "object"
                },
                "data": {
                  "type": "array",
                  "minItems": 1,
                  "items": {
                    "type": "object"
                  }
                }
              },
              "required": ["type", "label", "data"]
            }]
          }
        }
      }
    }]
  }
};

module.exports = constx;