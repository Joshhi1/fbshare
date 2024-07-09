const axios = require("axios");
const rl = require("readline-sync");
const figlet = require("figlet");
const chalk = require("chalk");
const utils = require("./utils");

figlet.text(
  "FBShare",
  {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  },
  (err, data) => {
    if (err) return console.error(err);

    console.log(chalk.blue(data));
    console.log(chalk.blue("--------------------------------------------"));
    console.log("    Created by: NicoDevs");
    console.log("    Facebook: Amiel Nico Diosa");
    console.log(chalk.blue("--------------------------------------------"));

    const choices = ["Cookie", "Token"];
    const index = rl.keyInSelect(
      choices,
      chalk.green("Choose how to share the post:"),
    );

    if (index !== -1) {
      const choice = choices[index];
      if (choice === "Cookie") {
        prepareSPUC();
      } else if (choice === "Token") {
        prepareSPUT();
      }
    }
  },
);

function prepareSPUC() {
  console.log();
  const user_email = rl.question("Enter your email: ");
  const user_password = rl.question("Enter your password: ", {
    hideEchoBack: true,
    mask: "",
  });
  const post_url = rl.question("Enter the Facebook post URL: ");

  const post_id = post_url.match(/\/(\d+)$/)[1];

  const cookie = utils.getUserCookie(user_email, user_password);
  if (!cookie) {
    console.log("Failed to get user cookie. Exiting...");
    return;
  }

  const share_interval = rl.questionInt(
    "Enter the interval in seconds between shares (e.g., 1 for 1 share/second): ",
  );
  const share_count = rl.questionInt("Enter the number of shares: ");

  for (let i = 0; i < share_count; i++) {
    setTimeout(
      () => {
        utils.sharePostUsingCookie(cookie, post_id);
      },
      i * share_interval * 1000,
    );
  }
}

function prepareSPUT() {
  console.log();
  const token = rl.question("Enter your Facebook access token: ");
  const share_url = rl.question("Enter the Facebook post URL: ");

  const share_interval = rl.questionInt(
    "Enter the interval in seconds between shares (e.g., 1 for 1 share/second): ",
  );
  const share_count = rl.questionInt("Enter the number of shares: ");

  for (let i = 0; i < share_count; i++) {
    setTimeout(
      () => {
        utils.sharePostUsingToken(token, share_url);
      },
      i * share_interval * 1000,
    );
  }
}
