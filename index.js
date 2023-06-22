const express = require("express");
const Joi = require("joi");
const morgan = require("morgan");
const cors = require("cors");

const CS2CS2 = require("./CS2CSWrapper");

const app = express();

// Enable CORS
app.use(cors());

// Enable JSON parsing for req.body
app.use(express.json());

// Enable logging for production
app.use(morgan("combined"), {
  skip: function (req, res) {
    if (req.url === "/") {
      return true;
    }
    return false;
  },
});

// Create a route for GET / that returns a message "Hello World"
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/cs2cs", async (req, res) => {
  try {
    // Joi validation for req.body
    const schema = Joi.object({
      fromCrs: Joi.string().required(),
      toCrs: Joi.string().required(),
      precision: Joi.number().optional(),
      coordinates: Joi.array()
        .items(
          Joi.object({
            x: Joi.number().required(),
            y: Joi.number().required(),
            z: Joi.number().optional(),
          })
        )
        .required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      res.status(400).json({ error: true, message: error.message });
      return;
    }

    // Get the cs2cswrapper
    const cs2cs = new CS2CS2(value.fromCrs, value.toCrs, value.precision);

    // Transform the coordinates
    const transformedCoordinates = await Promise.all(
      value.coordinates.map((coordinate) =>
        cs2cs.transformPoint(coordinate.x, coordinate.y, coordinate.z)
      )
    );

    res.status(200).json({
      count: transformedCoordinates.length,
      coordinates: transformedCoordinates,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

app.listen(8081, () => {
  console.log("Listening on port 8081");
});
