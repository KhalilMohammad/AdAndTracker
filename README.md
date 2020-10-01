## Description
This project uses puppeteer to check ads and trackers statistics.<br />
I am using https://pgl.yoyo.org list to get advertisers list.<br />
I am caching it on first request. If it's not there, I am downlading the list. <br />
Currently, it does not have a cache expiry date. <br />

For checking ads statistics, I am checking all iframes src that match the list.<br />
Also if the current domain belongs in the list, then I am ignoring that as an ad. <br />

For checking trackers, I am checking all xhr request made towards above list.<br />
Again, I am not including the current domain in the list of trackers even if the current domain is in the list. <br />

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
