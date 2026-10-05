# ScrollBoost

ScrollBoost 官方测试站与公开发行包。

- 官网由 `public/index.html` 和 `public/privacy.html` 组成，无需构建。
- Cloudflare Workers 静态资源部署配置位于 `wrangler.jsonc`。
- 官网的同域下载端点会流式转发 GitHub Release，并保留 GitHub 直链作为失败回退。
- Windows x64 安装包通过 GitHub Releases 发布。
- 应用程序源码不包含在本仓库中。

当前版本：v1.0.0
