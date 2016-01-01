'use strict';

var constx = {
  argumentSchema: {
    "type": "object",
    "oneOf": [{
      "properties": {
        "state": {
          "type": "string",
          "enum": ["complete", "failed"]
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
                "title": {
                  "type": "string"
                },
                "data": {
                  "type": ["boolean", "number", "string", "array", "object"]
                }
              },
              "required": ["type", "data"]
            }, {
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["record", "object"]
                },
                "title": {
                  "type": "string"
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
                "title": {
                  "type": "string"
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