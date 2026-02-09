PRD：Coding Plan Join Waitlist（活动页）

1. 背景与目标

- 背景：Novita 即将推出 Coding Plan，需要在活动页验证需求与预售意向。
- 目标：提升 Join waitlist 转化，完成有效登记。
- 非目标：不涉及 Coding Plan 产品功能与定价细节。

2. 受众与定位

- 受众：开发者 / AI 极客 / 程序员
- 语言：英文
- 核心诉求：抢先体验最新开源模型
- 次要诉求：相对 Claude Code 的成本优势

3. 用户流程

- 入口：活动页加入 Waitlist 入口（首屏或首屏下方第一屏）
- 未登录：点击后引导登录 → 登录后回到原位置
- 已登录：一键提交，无额外表单字段
- 重复提交：不新增记录，提示已在 Waitlist
- 成功态：展示已加入状态与提示
- 无下一步引导，仅可提示“继续体验活动页内容”

4. 功能需求

- 一键 Join waitlist
- 使用已注册邮箱
- 去重：同一 user_id 只保留一条
- 提示文案：
  - 成功：You’re on the waitlist
  - 已加入：You’re already on the waitlist
  - 失败：Please try again
- 可选提示：加入 Discord 获取第一手信息

5. 页面与文案

- 视觉：高区分度但不偏离现有活动页风格
- 文案强调：抢先体验为主，价格优势为辅
- FAQ：暂不新增，未来可补充

6. 数据与埋点

- 仅记录结果，不做点击/提交埋点
- 记录字段：user_id、email、created_at
- 不做 UTM/KOL 归因

7. 约束与风险

- 仅活动页功能
- 不提供取消/更改邮箱
- 不承诺具体上线时间与价格
