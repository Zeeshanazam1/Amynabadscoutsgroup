const fs = require("fs");
const path = require("path");

const filePath = path.join(
  "c:",
  "Users",
  "zeeshan.azam",
  "WEBSITE",
  "amynabad-scouts",
  "src",
  "components",
  "Auth.jsx"
);

let c = fs.readFileSync(filePath, "utf8");

// Fix 1: loading block - missing </div> before );
c = c.replace(
  '<div className="text-emerald-50">Loading...</div>\n    );',
  '<div className="text-emerald-50">Loading...</div>\n      </div>\n    );'
);

// Fix 2: signed-in block - missing </div> before );
c = c.replace(
  '<div className="mt-4 text-sm text-emerald-200">Check your email to verify your account.</div>}\n        </div>\n    );',
  '<div className="mt-4 text-sm text-emerald-200">Check your email to verify your account.</div>}\n        </div>\n      </div>\n    );'
);

// Fix 3: main return - missing </div> before <div className="bg-emerald-950/90
c = c.replace(
  '<div className="bg-emerald-950/90 border border-white/10 rounded-3xl shadow-2xl p-8 text-white">',
  '</div>\n        <div className="bg-emerald-950/90 border border-white/10 rounded-3xl shadow-2xl p-8 text-white">'
);

// Fix 4: main return - missing </div> before </div>\n  );
c = c.replace(
  '{message && <div className="mt-4 text-sm text-emerald-200">{message}</div>}\n        </div>\n    </div>\n  );',
  '{message && <div className="mt-4 text-sm text-emerald-200">{message}</div>}\n        </div>\n      </div>\n    </div>\n  );'
);

const openCount = (c.match(/<div\b[^>]*>/g) || []).length;
const closeCount = (c.match(/<\/div>/g) || []).length;
console.log("Divs: " + openCount + " open, " + closeCount + " close - balanced: " + (openCount === closeCount));

fs.writeFileSync(filePath, c, "utf8");
console.log("Auth.jsx fixed successfully");
