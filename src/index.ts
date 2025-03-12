import snmp from "net-snmp";
import IPCIDR from "ip-cidr";

const community = "public";
const sessionOptions = { version: snmp.Version2c, port: 10161 };

async function checkDevice(
  ip: string
): Promise<{ ip: string; hostname?: string; interfaces?: string[] }> {
  return new Promise((resolve) => {
    const session = snmp.createSession(ip, community, sessionOptions);
    const sysNameOid = "1.3.6.1.2.1.1.5.0";
    session.get([sysNameOid], (error, varbinds) => {
      if (error) {
        session.close();
        return resolve({ ip });
      }
      const hostname = varbinds[0]?.value?.toString() || "";
      const ifDescrOid = "1.3.6.1.2.1.2.2.1.2";
      let interfaces: string[] = [];
      session.walk(
        ifDescrOid,
        50,
        (varbind) => {
          if (varbind.value) {
            interfaces.push(varbind.value.toString());
          }
        },
        (err) => {
          session.close();
          if (err) {
            return resolve({ ip, hostname });
          } else {
            return resolve({ ip, hostname, interfaces });
          }
        }
      );
    });
  });
}

(async () => {
  const cidrRange = process.argv[2];
  if (!cidrRange) {
    console.error(
      "Please provide a CIDR range as argument, e.g., 192.168.0.0/24"
    );
    process.exit(1);
  }
  const cidr = new IPCIDR(cidrRange);
  const obj = cidr.toObject();
  if (!obj || !obj.start || !obj.end) {
    console.error("Invalid CIDR range.");
    process.exit(1);
  }
  let ipAddresses: string[] = [];
  if (obj.start === obj.end) {
    ipAddresses = [obj.start];
  } else {
    ipAddresses = cidr.toArray();
  }
  console.log(
    `Found ${ipAddresses.length} IP addresses in the range ${cidrRange}.`
  );

  const maxParallel = 10;
  let results: Array<{ ip: string; hostname?: string; interfaces?: string[] }> =
    [];
  for (let i = 0; i < ipAddresses.length; i += maxParallel) {
    const slice = ipAddresses.slice(i, i + maxParallel);
    const promises = slice.map((ip) => checkDevice(ip));
    const batchResults = await Promise.all(promises);
    results = [...results, ...batchResults];
  }

  console.log(
    "Debug IP array:",
    ipAddresses.slice(0, 10),
    "...",
    `total=${ipAddresses.length}`
  );

  results.forEach((device) => {
    if (device.hostname) {
      console.log(
        `___${device.ip}; ${device.hostname}; ${
          device.interfaces?.join(", ") || ""
        }___`
      );
    }
  });
})();
