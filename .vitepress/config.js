import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
  base: '/workpaper-docs/',
  title: '图像平滑与边缘保持滤波 — 数学推导知识库',
  description: '边缘保持图像平滑算法的核心数学推导，涵盖 GIF、WLS、L0、RTV 等经典模型',
  lang: 'zh-CN',

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { charset: 'utf-8' }],
  ],

  markdown: {
    config: (md) => {
      md.use(mathjax3)
    },
    math: true,
  },

  themeConfig: {
    logo: '📐',
    nav: [
      { text: '首页', link: '/' },
      { text: '经典滤波器', link: '/papers/gif' },
      { text: '全局优化', link: '/papers/wls' },
      { text: 'L0 稀疏', link: '/papers/l0' },
    ],

    sidebar: [
      {
        text: '引言',
        items: [
          { text: '知识库概览', link: '/' },
          { text: '符号约定', link: '/notation' },
        ],
      },
      {
        text: '局部线性模型（引导滤波族）',
        collapsed: false,
        items: [
          { text: 'GIF — 引导图像滤波', link: '/papers/gif' },
          { text: 'WGIF — 加权引导滤波', link: '/papers/wgif' },
          { text: 'GGIF — 梯度域引导滤波', link: '/papers/ggif' },
          { text: 'EGIF — 边缘引导滤波', link: '/papers/egif' },
          { text: 'RGF — 滚动引导滤波 (ECCV)', link: '/papers/rgf' },
          { text: 'SD Filter — 非凸势函数鲁棒 GIF', link: '/papers/sdfilter' },
          { text: 'AGF — 各向异性引导滤波', link: '/papers/agf' },
          { text: 'MGIF — 互引导图像滤波', link: '/papers/mgif' },
          { text: 'ISGIF — 迭代结构引导滤波', link: '/papers/isgif' },
          { text: 'DeepGIF — 深度引导滤波', link: '/papers/deepgif' },
          { text: 'SGRIF — 视网膜图像结构保持滤波', link: '/papers/sgrif' },
        ],
      },
      {
        text: '全局加权最小二乘（WLS 族）',
        collapsed: false,
        items: [
          { text: 'WLS — 边缘保持分解', link: '/papers/wls' },
          { text: 'FGS — 快速全局平滑', link: '/papers/fgs' },
          { text: 'ILS — 迭代最小二乘实时平滑', link: '/papers/ils' },
          { text: 'BFLS — 双边滤波嵌入最小二乘', link: '/papers/bfls' },
          { text: 'SGWLS — 结构引导加权最小二乘', link: '/papers/sgwls' },
          { text: 'QWLS — 二次加权最小二乘', link: '/papers/qwls' },
          { text: 'TMM 2018 — 尺度感知迭代全局优化', link: '/papers/tmm2018' },
        ],
      },
      {
        text: 'L0 / 稀疏梯度模型',
        collapsed: false,
        items: [
          { text: 'L0 Smoothing — L0 梯度最小化', link: '/papers/l0' },
          { text: 'RTV — 相对全变分结构提取', link: '/papers/rtv' },
          { text: 'L0G — L0 梯度正则化 (中文)', link: '/papers/l0g' },
          { text: 'L-Gradient — 卡通纹理分解', link: '/papers/lgradient' },
          { text: 'TDS — 纹理细节分离算法', link: '/papers/tds' },
          { text: 'DIP+L0 — 深度图像先验 + L0', link: '/papers/dip_l0' },
        ],
      },
      {
        text: '域变换与快速滤波',
        collapsed: false,
        items: [
          { text: 'Domain Transform — 域变换边缘感知处理', link: '/papers/domain_transform' },
          { text: 'FS — 快速平滑 (TCSVT 2013)', link: '/papers/fs' },
        ],
      },
      {
        text: '深度学习方法',
        collapsed: false,
        items: [
          { text: 'SRCNN — 超分辨率卷积网络', link: '/papers/srcnn' },
          { text: 'Deep Image Prior — 深度图像先验', link: '/papers/dip' },
          { text: 'ZF — 全卷积快速图像处理', link: '/papers/zf' },
          { text: 'Unsupervised Smoothing — 无监督学习平滑', link: '/papers/unsupervised' },
        ],
      },
      {
        text: '其他应用',
        collapsed: false,
        items: [
          { text: 'Pencil Drawing — 铅笔画生成', link: '/papers/pencil' },
          { text: 'GCP Denoising — 绿通道先验去噪', link: '/papers/gcp' },
          { text: 'TH 2022 — TPAMI 纹理分层', link: '/papers/th2022' },
        ],
      },
    ],

    socialLinks: [],
    footer: {
      message: '基于公开学术论文的数学推导知识库',
    },
    search: {
      provider: 'local',
    },
  },
})
