# talos-ai.org

Talos 官网，单页静态网站，部署在自己的服务器上，由 nginx 提供网页，HTTPS 证书由 certbot（Let's Encrypt）申请和续期。

## 上线前先核对这几处
- **联系邮箱**：Contact 使用 `sales@talos-ai.org`，Careers 使用 `career@talos-ai.org`。这两个地址要先在 Workspace 里建好：Admin 控制台 → 用户 → 你的账号 → 添加备用邮箱；也可以建群组让多人同时收到。地址在 `index.html` 里修改。
- **文案是根据我们的样题写的**：三类任务（来自开源 PR 的 Python/Go 软件工程题、带模拟仪器的计算科学题、Blender/MuJoCo 物理仿真题）、完整的 agent 轨迹、独立且断网的评分环境、fail-to-pass / pass-to-pass、证据回放评分，以及 Harbor 交付格式。如果以后业务范围变了，记得同步修改。
- 首屏背景滚动的是 `task.toml`、测试脚本、reward 计算和 agent 日志，字段和流程跟样题一致，但名字和数值都换成了中性内容。网页上没有放任何一道真实题目的原文、隐藏测试或答案。
- **Platform 板块**介绍 talos-sky（连接 Data、Models、Benchmarks、Sandboxes 和云算力的那一层）。图和代码都是在 `index.html` 里手写的 SVG 和 HTML；代码块标注了 "in development"，SDK 上线后记得去掉，并换成真实可运行的例子。
- 页面里故意没放客户 logo、投资方和数据指标。等有了真实的、可以公开的信息再加。

## 部署到自己的服务器
1. **DNS**（Squarespace）：删掉 "Squarespace Defaults" 那组记录，包括 4 条指向 198.185.159.x / 198.49.23.x 的 A 记录，和 `www` → `ext-sq.squarespace.com` 的 CNAME。然后新增两条 A 记录：`@` → 服务器 IP，`www` → 服务器 IP。Google Workspace 的 MX 和 TXT 记录不要动。
2. **服务器**：在云厂商的安全组里放行 TCP 80 和 443 端口，装好 nginx（`sudo apt install -y nginx`）。
3. **上传并部署**：把这个仓库放到服务器上（`git clone` 或从 Mac 复制），在仓库目录里执行 `sudo deploy/deploy.sh`。它会：
   - 把网页文件和 `fonts/` 复制到 `/var/www/talos-ai.org`；
   - 安装 `deploy/talos-ai.org.nginx.conf` 到 `/etc/nginx/sites-available/` 并启用（旧配置会先备份）；
   - 没装 certbot 时自动安装，为 `talos-ai.org` 和 `www.talos-ai.org` 申请证书，并把 http 跳转到 https。

   以后改了网页，在服务器上更新仓库后再执行一次 `sudo deploy/deploy.sh` 即可。证书由 certbot 的定时任务自动续期。
4. 服务器如果在中国大陆，网站必须先做 ICP 备案才能用 80/443 端口访问。选香港或海外的服务器就不需要备案。

## 首屏动画
首屏右侧是一条环境的运行记录：一个 agent 的设计（FPGA 载板、涡轮级、六轴机械臂轮播）依次经过 Design、Simulate、Manufacture、Test，最后落到 reward。左栏按阶段切换：工程图纸、仿真图（眼图、叶栅流线、关节力矩）、设备程序（贴片、G 代码、装配）、测试曲线。全部由 `index.html` 里的脚本用 three.js 和 SVG 现场生成，不加载任何图片。
- 任务 brief、工具、verifier、工位编号、程序行、曲线和 reward 数值都是示意的占位内容，等有了真实任务和工厂再替换。
- 调试：在地址后加 `?t=秒数` 可以把动画定格在某一刻（每个环境 18.4 秒，三个环境共 55.2 秒）。
- three.js 自托管在 `vendor/three/`（r170，MIT），不依赖 CDN。

## 文件说明
- `index.html`：首页，样式和脚本都写在里面
- `vendor/three/`：首屏动画用的 three.js 及其两个 addon
- `workflows/`：Workflows 子页（/workflows/），介绍我们的开发流程和三个工具。`index.html` 是总览，`claude-x/`、`talos-sky/`、`easy-harbor/` 各是一个工具的子页；四个页面共用 `workflows.css` 和 `workflows.js`（分步动画图）。新增页面或文件时，记得同时加进 `deploy/deploy.sh` 的文件清单
- `favicon.*`、`apple-touch-icon.png`、`icon-*.png`、`site.webmanifest`：网站图标，来自 `talos-brand/web/`
- `og-image.png`：在微信、Slack、X 里分享链接时显示的预览图
- `fonts/`：Archivo 字体（自托管，不依赖 Google Fonts）及其 OFL 许可
- `deploy/`：部署脚本和 nginx 配置
- `CNAME`：只在用 GitHub Pages 时才需要，部署到自己的服务器时可以忽略
