const axios = require("axios");
const cheerio = require("cheerio");

async function getUserCookie(userEmail, userPassword) {
  const url = "https://n.facebook.com";
  const xurl = url + "/login.php";
  const userAgent =
    "Mozilla/5.0 (Linux; Android 4.1.2; GT-I8552 Build/JZO54K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36";
  const headers = {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en_US",
    "cache-control": "max-age=0",
    "sec-ch-ua":
      '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": userAgent,
  };
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const lsdKey = $('input[name="lsd"]').attr("value");
    const jazoestKey = $('input[name="jazoest"]').attr("value");
    const mTsKey = $('input[name="m_ts"]').attr("value");
    const liKey = $('input[name="li"]').attr("value");
    const tryNumberKey = $('input[name="try_number"]').attr("value");
    const unrecognizedTriesKey = $('input[name="unrecognized_tries"]').attr(
      "value",
    );
    const biXrwhKey = $('input[name="bi_xrwh"]').attr("value");
    const data = {
      lsd: lsdKey,
      jazoest: jazoestKey,
      m_ts: mTsKey,
      li: liKey,
      try_number: tryNumberKey,
      unrecognized_tries: unrecognizedTriesKey,
      bi_xrwh: biXrwhKey,
      email: userEmail,
      pass: userPassword,
      login: "submit",
    };
    const response2 = await axios.post(xurl, data, {
      allowRedirects: true,
      timeout: 300,
    });
    const cookies = response2.headers["set-cookie"]
      .map((cookie) => cookie.split(";")[0])
      .join("; ");

    if (cookies.includes("c_user")) {
      return cookies;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getFacebookToken(cookie) {
  const headers = {
    authority: "business.facebook.com",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language":
      "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
    "cache-control": "max-age=0",
    cookie: cookie,
    referer: "https://www.facebook.com/",
    "sec-ch-ua":
      '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
  };
  try {
    const response = await axios.get(
      "https://business.facebook.com/content_management",
      { headers },
    );
    const token = response.data.split("EAAG")[1].split('","')[0];
    return `${cookie}|EAAG${token}`;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function sharePostUsingCookie(cookie, postId, successCounter) {
  const headers = {
    accept: "*/*",
    "accept-encoding": "gzip, deflate",
    connection: "keep-alive",
    "content-length": "0",
    cookie: cookie,
    host: "graph.facebook.com",
  };
  try {
    const response = await axios.post(
      `https://graph.facebook.com/me/feed?link=https://m.facebook.com/${postId}&published=0`,
      null,
      { headers },
    );
    if (response.data && response.data.id) {
      successCounter[0]++;
      console.log(
        `Share successful for post ID ${postId} - ${successCounter[0] + 1}`,
      );
    } else {
      console.log(
        `Error during sharing. Response: ${JSON.stringify(response.data)}`,
      );
    }
  } catch (error) {
    console.error(`Error sharing: ${error}`);
  }
}

async function sharePostUsingToken(accessToken, shareUrl) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/me/feed?access_token=${accessToken}&fields=id&limit=1&published=0`,
      {
        link: shareUrl,
        privacy: { value: "SELF" },
        no_story: true,
      },
      {
        headers: {
          authority: "graph.facebook.com",
          "cache-control": "max-age=0",
          "sec-ch-ua-mobile": "?0",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
        },
      },
    );

    const postId = response?.data?.id;

    console.log(`Post shared`);
    console.log(`Post ID: ${postId || "Unknown"}`);

    return postId;
  } catch (error) {
    console.error("Failed to share post:", error.response.data);
    return null;
  }
}

async function deletePostUsingToken(accessToken, postId) {
  try {
    await axios.delete(
      `https://graph.facebook.com/${postId}?access_token=${accessToken}`,
    );
    console.log(`Post deleted: ${postId}`);
  } catch (error) {
    console.error("Failed to delete post:", error.response.data);
  }
}

module.exports = {
  getUserCookie,
  getFacebookToken,
  sharePostUsingCookie,
  sharePostUsingToken,
  deletePostUsingToken,
};
