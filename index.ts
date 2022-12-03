import readline from "readline";
import process from "process";
import fs from "fs/promises";
import _ from "lodash";

type Strategy = "sequential" | "random";

let people: string[] = [];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

async function loadFromFile() {
  if (!(await fs.open("data.json"))) {
    console.error("No data set to seed from.");
    process.exit(1);
  } else {
    people = JSON.parse(
      (await fs.readFile("data.json")).toString()
    ) as string[];

    await determineGroups();
  }
}

async function readFromIO() {
  rl.on("line", (line) => {
    if (!line || line.length === 0) {
      rl.close();
      return;
    }

    if (line.includes(",")) {
      line.split(",").forEach((u) => {
        people.push(u.trim());
      });
    } else {
      people.push(line);
    }
  });

  rl.on("close", () => determineGroups());
}

async function determineGroups() {
  let perGroup: number = 2;
  let strategy: Strategy;
  const argv = process.argv.splice(2) || [];

  if (argv.length > 0) {
    argv.forEach((a) => {
      if (a.startsWith("--strategy=")) {
        strategy = a.replace("--strategy=", "") as Strategy;
      } else {
        strategy = "sequential";
      }
    });
  }

  console.log("Groups of:", perGroup!!);
  console.log("Strategy:", strategy!!);

  if (people.length % perGroup != 0) {
    console.error(
      `Cannot make groups of ${perGroup} with ${people.length} people`
    );
    process.exit(1);
    return;
  }

  let counter = 0;
  const targetPeople = strategy!! == "random" ? _.shuffle(people) : people;

  do {
    const group: string[] = [];

    for (let i = 0; i < perGroup; i++) {
      group.push(targetPeople.shift()!!);
    }

    counter++;
    console.log(`Group ${counter}:`, [...group].join(", "));
  } while (targetPeople.length !== 0);

  process.exit(0);
}

async function main() {
  if (
    process.argv &&
    process.argv.length > 0 &&
    process.argv.includes("--seed")
  ) {
    await loadFromFile();
  } else {
    await readFromIO();
  }
}

main();
