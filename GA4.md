# GA4 Analytics Tracking Plan: RenderArena

> 本文档根据业务目标和GA4最佳实践设计，旨在通过数据驱动产品迭代和运营决策。
>
> - **核心目标:** 为 Novita 主站引流，并衡量关键用户转化路径。
> - **分析工具:** Google Analytics 4 (GA4)
> - **最后更新:** 2026-01-28

---

## Part 1: Reporting & Analysis Plan

### 1.1. 核心指标总览仪表盘 (KPI Dashboard)

此仪表盘用于快速概览业务健康状况，回答“发生了什么”的问题。

| 指标 (Metric)           | 计算方式 / 事件                        | 业务问题                                 |
| :---------------------- | :------------------------------------- | :--------------------------------------- |
| **活跃用户**            | GA4 `Active Users`                     | 我的产品有多少人在用？                   |
| **总注册数**            | `signup_completed` 事件总数            | 我总共获得了多少新注册用户？             |
| **注册转化率**          | `signup_completed` / `New Users`       | 新访客的注册转化效率高吗？               |
| **总分享数**            | `result_shared` 事件总数               | 用户总共分享了多少次？                   |
| **病毒系数 (K-Factor)** | `shared_item_viewed` / `result_shared` | 平均每次分享能带来几个新访客？           |
| **核心功能使用量**      | `generation_started` 事件总数          | 产品的核心功能（生成）被使用了多少次？   |
| **付费意向用户数**      | `upgrade_button_clicked` 事件总数      | 有多少人点击了升级按钮，表现出付费意向？ |

### 1.2. 关键转化漏斗分析 (Key Funnel Analysis)

在GA4“探索(Explore)”中创建，用于诊断转化过程，回答“为什么发生”的问题。

**漏斗 1: 新用户注册转化漏斗**

> **目的:** 诊断“额度用尽弹窗”对新用户的注册转化效率。

| 步骤 | 事件名称                                             |
| :--- | :--------------------------------------------------- |
| 1    | `generation_started` (Filter: `user_tier` = `guest`) |
| 2    | `login_started`                                      |
| 3    | `signup_completed`                                   |

**漏斗 2: 付费意向转化漏斗**

> **目的:** 诊断从“引导升级”到“点击升级”的转化效率。

| 步骤 | 事件名称                                                  |
| :--- | :-------------------------------------------------------- |
| 1    | `generation_started` (Filter: `user_tier` = `registered`) |
| 2    | `upgrade_prompt_displayed`                                |
| 3    | `upgrade_button_clicked`                                  |

**漏斗 3: 病毒循环增长漏斗**

> **目的:** 诊断“分享-浏览-注册”这一病毒循环的拉新效率。

| 步骤 | 事件名称             |
| :--- | :------------------- |
| 1    | `result_shared`      |
| 2    | `shared_item_viewed` |
| 3    | `signup_completed`   |

---

## Part 2: Event Tracking Implementation Plan

### 2.1. 核心转化漏斗事件

| 事件名称 (Event Name)          | 描述                                             | 参数 (Parameters)                             | 触发时机 (Trigger)                   |
| :----------------------------- | :----------------------------------------------- | :-------------------------------------------- | :----------------------------------- |
| **`generation_started`**       | 用户开始一次新的模型生成。                       | -                                             | 用户在首页或Remix页点击“生成”按钮。  |
| **`login_started`**            | 游客额度用尽或点击分享，喜欢，系统展示登录提示。 | `location`: (quota/publish/like/header)       | 游客第6次生成结束后，点击分享、喜欢  |
| **`signup_completed`**         | 用户成功注册或登录。                             | -                                             | 用户通过Novita成功注册或登录后。     |
| **`upgrade_prompt_displayed`** | 注册用户额度用尽，系统展示升级提示。             | -                                             | 注册用户第20次生成结束后。           |
| **`upgrade_button_clicked`**   | 用户点击“升级”按钮。                             | `location`: (overwhelming_banner/quota_modal) | 用户点击任何导向付费页的“升级”按钮。 |

### 2.2. 增长与参与度事件

| 事件名称 (Event Name)        | 描述                             | 参数 (Parameters)                                                                                       | 触发时机 (Trigger)                               |
| :--------------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| **`result_shared`**          | 用户点击分享，成功生成分享链接。 | `content_id`: (string)<br>`share_method`: (copy_link/x/linkedin/facebook)<br>`share_type`: (video/link) | 在分享弹窗中，用户点击“复制链接”或社交媒体按钮。 |
| **`shared_item_viewed`**     | 用户通过分享链接访问一个作品页。 | `content_id`: (string)                                                                                  | 页面加载时，URL中包含分享来源参数。              |
| **`remix_started`**          | 用户点击“Remix”一个画廊作品。    | `content_id`: (string)                                                                                  | 用户在作品详情页点击“Remix”按钮。                |
| **`hackathon_join_clicked`** | 用户点击加入黑客松的按钮。       | -                                                                                                       | 用户在首页或相关页面点击“加入黑客松”CTA按钮。    |

### 2.3. 用户属性 (User Properties)

| 属性名称 (Property Name) | 描述           | 值 (Examples)                     | 设置时机                           |
| :----------------------- | :------------- | :-------------------------------- | :--------------------------------- |
| **`user_tier`**          | 用户的当前等级 | `guest`, `registered`, `upgraded` | 用户状态改变时（如登录、付费后）。 |

---

## Part 3: GA4 Configuration Guide

### 3.1. 注册自定义维度 (Custom Dimensions)

在GA4后台 `管理(Admin)` > `自定义设置(Custom Definitions)` > `自定义维度(Custom Dimensions)` 中创建：

| 维度名称     | 范围 (Scope) | 事件参数 (Event Parameter) |
| :----------- | :----------- | :------------------------- |
| User Tier    | User         | `user_tier`                |
| Share Method | Event        | `share_method`             |
| Share Type   | Event        | `share_type`               |
| Content ID   | Event        | `content_id`               |
| Location     | Event        | `location`                 |

### 3.2. 标记转化为“转化事件” (Conversions)

在GA4后台 `管理(Admin)` > `转化(Conversions)` 中，将以下事件标记为转化：

- `signup_completed`
- `upgrade_button_clicked`

### 3.3. 创建漏斗报告 (Funnel Reports)

1.  前往GA4左侧导航栏的 `探索 (Explore)`。
2.  创建一个新的 **“漏斗探索 (Funnel exploration)”** 报告。
3.  在“步骤 (Steps)”设置中，按照 **Part 1.2** 中定义的漏斗路径，依次添加事件。
4.  如果需要，为步骤添加过滤器（例如，在 `generation_started` 步骤中，过滤 `user_tier` 等于 `guest`）。
5.  保存报告并命名，即可开始分析。
