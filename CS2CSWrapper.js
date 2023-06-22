const { spawn } = require("child_process");

class CS2CSWrapper {
  constructor(fromCrs, toCrs, precision = 8) {
    this.fromCrs = fromCrs;
    this.toCrs = toCrs;
    this.precision = precision;
  }

  transformPoint(x, y, z = 0) {
    return new Promise((resolve, reject) => {
      const command = "cs2cs";
      const args = [
        "--3d",
        `${this.fromCrs}`,
        `${this.toCrs}`,
        "-f",
        `%.${this.precision}f`,
      ];

      console.log(args.join(" "));

      const subprocess = spawn(command, args);

      // Prepare the input point string
      const pointString = `${x} ${y} ${z}`;

      subprocess.stdin.write(pointString);
      subprocess.stdin.end();

      // Event handlers for subprocess output
      subprocess.stdout.on("data", (data) => {
        console.log(`Subprocess output: ${data}`);

        // Extract the transformed coordinates
        const transformedX = parseFloat(
          data.toString().split(" ")[0].split("\t")[0]
        );
        const transformedY = parseFloat(
          data.toString().split(" ")[0].split("\t")[1]
        );
        const transformedZ = parseFloat(
          data.toString().split("\n")[0].split(" ")[1]
        );

        resolve({
          x: transformedX,
          y: transformedY,
          z: transformedZ,
        });
      });

      subprocess.stderr.on("data", (data) => {
        console.error(`Subprocess error: ${data}`);
        reject(new Error(data));
      });
    });
  }
}

module.exports = CS2CSWrapper;
