---
layout: home

hero:
  name: "图像平滑与边缘保持滤波"
  text: "核心数学推导知识库"
  tagline: 33 篇顶会论文 · 保姆级 Step-by-Step 推导 · LaTeX 全渲染
  actions:
    - theme: brand
      text: 从 GIF 开始
      link: /papers/gif
    - theme: alt
      text: L0 梯度最小化
      link: /papers/l0

features:
  - icon: 📐
    title: 局部线性模型族
    details: GIF / WGIF / GGIF / EGIF / RGIF / SD Filter / AGF / MGIF — 从引导滤波的能量泛函出发，逐步推导闭式解与滤波核
  - icon: 🔢
    title: 全局加权最小二乘族
    details: WLS / FGS / ILS / BFLS / SGWLS / QWLS — 稀疏线性系统的构建、FFT 加速与三对角分解
  - icon: ⚡
    title: L0 稀疏梯度模型
    details: L0 Smoothing / RTV / TDS — 半二次分裂（Half-Quadratic Splitting）的完整推导，含 FFT 子问题闭式解
  - icon: 🧠
    title: 深度学习方法
    details: SRCNN / Deep Image Prior / DeepGIF / ZF — 网络结构与损失函数的数学形式化
---

## 知识库结构

本知识库系统整理了 **边缘保持图像平滑** 领域 33 篇顶会论文的核心数学内容，按算法族分类：

| 算法族 | 代表论文 | 核心工具 |
|--------|---------|---------|
| 局部线性模型 | GIF (TPAMI'13), WGIF (TIP'15) | 窗口内最小二乘，闭式解 |
| 全局 WLS | WLS (SIGGRAPH'08), FGS (TIP'14) | 稀疏线性系统，PCG/三对角 |
| L0 稀疏 | L0 (SIGGRAPH'11), RTV (SIGGRAPH'12) | 半二次分裂，FFT 子问题 |
| 域变换 | Domain Transform (SIGGRAPH'11) | 1D 递归滤波 |
| 深度学习 | SRCNN, DIP, DeepGIF | CNN，无监督优化 |

## 数学符号约定

全库统一使用以下符号（详见[符号约定页](/notation)）：

- $I, g$ — 输入图像 / 引导图像（标量场或向量场）
- $u, S$ — 平滑输出图像
- $\lambda$ — 正则化权重（越大越平滑）
- $\epsilon$ — 数值稳定小常数
- $\omega_k$ — 以像素 $k$ 为中心的局部窗口
- $\mathcal{F}, \mathcal{F}^{-1}$ — 二维离散傅里叶变换及其逆变换
- $\partial_x, \partial_y$ — 水平/垂直有限差分算子
