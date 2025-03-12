# SNMP Device Scanner

This application scans a given CIDR range for SNMP devices, retrieves their hostname (sysName) and interface list (ifDescr), and then outputs the results in the following format:

___IP address; hostname; interfaces___

For example:

___192.168.0.2; router 1; eth0, eth1, eth2___
___192.168.0.3; router 2; eth0, eth1, eth2, eth3, eth4___

## Requirements

- Node.js (v18 or higher)
- npm
- TypeScript
- SNMP simulator (e.g., snmpsim) for testing
- IP aliases (optional – if you want to simulate multiple devices)

## Installation & Build

1. Clone the repository or download the source code.
2. Open a terminal in the project root directory.
3. Install the dependencies:

    ```bash
    npm install
    ```

4. Build the project:

    ```bash
    npm run build
    ```

## Project Configuration

- The project uses the ESM module system.
- The `package.json` file has `"type": "module"` to ensure Node.js runs the code as ESM.
- TypeScript is configured via `tsconfig.json` with `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`.

## Running the SNMP Simulator

1. Create a folder for simulated data and add your SNMP record files (.snmprec). For example:

    ```bash
    mkdir -p /home/anty/Work/Ubiquiti/snmpdata
    echo "1.3.6.1.2.1.1.5.0|4|MySimulatedRouter" > /home/anty/Work/Ubiquiti/snmpdata/public.snmprec
    ```

2. Launch the SNMP simulator (in a separate terminal; if using a virtual environment, activate it first):

    ```bash
    snmpsim-command-responder \
      --data-dir=/home/anty/Work/Ubiquiti/snmpdata \
      --agent-udpv4-endpoint=0.0.0.0:10161
    ```

    This command starts the simulator, loading data from the [snmpdata](http://_vscodecontentref_/1) folder and listening on port 10161.

## Running the Application

Run the application by providing a CIDR range as an argument. For example, to scan a /24 network:

```bash
npm run start -- 192.168.0.0/24
```
