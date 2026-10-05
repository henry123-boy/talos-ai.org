# talos-ai.org

Talos 官网，单页静态网站，部署在自己的服务器上，由 Caddy 提供 HTTPS。

## 上线前先核对这几处
- **联系邮箱 `hello@talos-ai.org`**：Careers 和 Contact 两处用到这个地址。这个邮箱要先在 Workspace 里建好：Admin 控制台 → 用户 → 你的账号 → 添加备用邮箱；也可以建一个群组，让几个人同时收到。如果想换成别的地址，在 `index.html` 里全局替换。
- **文案是根据我们的样题写的**：两类任务（来自开源 PR 的 Python/Go 软件工程题、带模拟仪器的计算科学题）、完整的 agent 轨迹、独立且断网的评分环境、fail-to-pass / pass-to-pass、证据回放评分，以及 Harbor 交付格式。如果以后业务范围变了，记得同步修改。
- 首屏背景滚动的是 `task.toml`、测试脚本、reward 计算和 agent 日志，字段和流程跟样题一致，但名字和数值都换成了中性内容。网页上没有放任何一道真实题目的原文、隐藏测试或答案。
- 页面里故意没放客户 logo、投资方和数据指标。等有了真实的、可以公开的信息再加。

## 部署到自己的服务器
1. **DNS**（Squarespace）：删掉 "Squarespace Defaults" 那组记录，包括 4 条指向 198.185.159.x / 198.49.23.x 的 A 记录，和 `www` → `ext-sq.squarespace.com` 的 CNAME。然后新增两条 A 记录：`@` → 服务器 IP，`www` → 服务器 IP。Google Workspace 的 MX 和 TXT 记录不要动。
2. **服务器**：在云厂商的安全组里放行 TCP 80 和 443 端口。安装 Caddy（`sudo apt install -y caddy`），把 `/etc/caddy/Caddyfile` 写成下面这样，再执行 `sudo systemctl reload caddy`。DNS 生效后，Caddy 会自动申请 HTTPS 证书。

   ```
   talos-ai.org {
       root * /var/www/talos-ai.org
       encode gzip
       file_server
   }
   www.talos-ai.org {
       redir https://talos-ai.org{uri} permanent
   }
   ```
3. **上传网页**（在 Mac 上执行，`USER@SERVER_IP` 换成你的服务器）：

   ```
   ssh USER@SERVER_IP 'sudo mkdir -p /var/www/talos-ai.org && sudo chown $USER /var/www/talos-ai.org'
   rsync -avz --delete --exclude .git --exclude README.md ./ USER@SERVER_IP:/var/www/talos-ai.org/
   ```
4. 服务器如果在中国大陆，网站必须先做 ICP 备案才能用 80/443 端口访问。选香港或海外的服务器就不需要备案。

## 文件说明
- `index.html`：整个页面，样式和脚本都写在里面。字体从 Google Fonts 加载
- `favicon.*`、`apple-touch-icon.png`、`icon-*.png`、`site.webmanifest`：网站图标，来自 `talos-brand/web/`
- `og-image.png`：在微信、Slack、X 里分享链接时显示的预览图
- `CNAME`：只在用 GitHub Pages 时才需要，部署到自己的服务器时可以忽略
