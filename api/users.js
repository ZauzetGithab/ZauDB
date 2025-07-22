import fetch from "node-fetch";

const GITHUB_REPO = "ZauzetGithab/ZauDB"; // ganti ke repo lo
const FILE_PATH = "users.json";
const TOKEN = process.env.GITHUB_TOKEN; // token disimpan di Vercel Env

export default async function handler(req, res) {
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
  
  async function getUsers() {
    const data = await fetch(apiUrl, {
      headers: { Authorization: `token ${TOKEN}` }
    }).then(r=>r.json());
    const content = Buffer.from(data.content, "base64").toString();
    return { list: JSON.parse(content), sha: data.sha };
  }

  if (req.method === "GET") {
    const { list } = await getUsers();
    return res.json(list);
  }

  if (req.method === "POST") {
    const { username, password, role, expired } = req.body;
    const { list, sha } = await getUsers();
    list.push({ username, password, role, expired });
    await fetch(apiUrl, {
      method:"PUT",
      headers:{ 
        Authorization: `token ${TOKEN}`, 
        "Content-Type":"application/json" 
      },
      body: JSON.stringify({
        message:"Add user",
        content: Buffer.from(JSON.stringify(list,null,2)).toString("base64"),
        sha
      })
    });
    return res.json({ success:true });
  }

  if (req.method === "DELETE") {
    const { username } = req.body;
    const { list, sha } = await getUsers();
    const updated = list.filter(u=>u.username!==username);
    await fetch(apiUrl, {
      method:"PUT",
      headers:{ 
        Authorization: `token ${TOKEN}`, 
        "Content-Type":"application/json" 
      },
      body: JSON.stringify({
        message:`Delete ${username}`,
        content: Buffer.from(JSON.stringify(updated,null,2)).toString("base64"),
        sha
      })
    });
    return res.json({ success:true });
  }

  res.status(405).json({ error: "Method Not Allowed" });
      }
