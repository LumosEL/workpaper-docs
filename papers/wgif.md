# WGIF — 加权引导图像滤波

> **论文：** Weighted Guided Image Filtering  
> **作者：** Zhengguo Li, Jinghong Zheng, Zijian Zhu, Wei Yao, Shiqian Wu  
> **发表：** IEEE TIP 2015  
> **意义：** 解决 GIF 的梯度反转问题，通过边缘感知权重 $\Gamma$ 自适应调节正则化强度

---

## 1. GIF 的梯度反转问题

GIF 在纹理区域会产生**梯度反转（Gradient Reversal）**：纹理区域的方差 $\sigma_k^2$ 较大，导致 $a_k$ 偏大，在边缘附近引入虚假梯度，使输出图像在边缘处出现"振铃"。

**根本原因：** GIF 对所有窗口使用相同的正则化强度 $\epsilon$，无法区分"真实边缘"和"纹理"。

---

## 2. 核心改进：边缘感知权重

WGIF 修改 GIF 的能量泛函，引入**边缘感知权重** $\Gamma_G(p')$：

$$E(a_{p'}, b_{p'}) = \sum_{p \in \zeta_1(p')} \left[ (a_{p'} G(p) + b_{p'} - X(p))^2 + \frac{\lambda}{\Gamma_G(p')} a_{p'}^2 \right] \tag{1}$$

**与 GIF 的区别：** 正则项从 $\epsilon a_k^2$ 变为 $\frac{\lambda}{\Gamma_G(p')} a_{p'}^2$，其中 $\Gamma_G(p')$ 在边缘处大、在平坦区域小。

---

## 3. 边缘感知权重 $\Gamma_G$ 的定义

$$\Gamma_G(p') = \frac{1}{N} \sum_{p=1}^{N} \frac{\sigma^2_{G,\mathbf{1}(p')} + \varepsilon}{\sigma^2_{G,\mathbf{1}(p)} + \varepsilon} \tag{2}$$

其中：
- $\sigma^2_{G,\mathbf{1}(p')}$ — 引导图像 $G$ 在以 $p'$ 为中心的 $3\times3$ 窗口内的方差
- $N$ — 图像总像素数
- $\varepsilon = (0.001 \times L)^2$，$L$ 为图像动态范围（灰度图 $L=255$，归一化图 $L=1$）

### 3.1 $\Gamma_G$ 的性质

$$\frac{1}{N}\sum_{p'=1}^N \Gamma_G(p') = 1 \tag{3}$$

即 $\Gamma_G$ 的全图均值为 1。

**在边缘处：** $\sigma^2_{G,\mathbf{1}(p')}$ 大（局部方差大）$\Rightarrow$ $\Gamma_G(p') > 1$ $\Rightarrow$ 有效正则化 $\lambda/\Gamma_G$ 小 $\Rightarrow$ $a_{p'}$ 可以较大（保留边缘）

**在平坦区域：** $\sigma^2_{G,\mathbf{1}(p')}$ 小 $\Rightarrow$ $\Gamma_G(p') < 1$ $\Rightarrow$ 有效正则化 $\lambda/\Gamma_G$ 大 $\Rightarrow$ $a_{p'}$ 被压缩（强平滑）

---

## 4. 闭式解推导

### 4.1 对 $b_{p'}$ 求偏导

$$\frac{\partial E}{\partial b_{p'}} = 2\sum_{p \in \zeta_1(p')}(a_{p'} G(p) + b_{p'} - X(p)) = 0$$

$$\boxed{b_{p'} = \mu_{X,\zeta_1(p')} - a_{p'} \mu_{G,\zeta_1(p')}} \tag{4}$$

### 4.2 对 $a_{p'}$ 求偏导

将 $b_{p'}$ 代入，令 $\tilde{G}_p = G(p) - \mu_{G,\zeta_1(p')}$，$\tilde{X}_p = X(p) - \mu_{X,\zeta_1(p')}$：

$$\frac{\partial E}{\partial a_{p'}} = 2\sum_{p \in \zeta_1(p')}(a_{p'}\tilde{G}_p - \tilde{X}_p)\tilde{G}_p + \frac{2\lambda}{\Gamma_G(p')} a_{p'} = 0$$

$$a_{p'}\left(\sum_p \tilde{G}_p^2 + \frac{\lambda}{\Gamma_G(p')}\right) = \sum_p \tilde{G}_p \tilde{X}_p$$

$$\boxed{a_{p'} = \frac{\mu_{G \odot X, \zeta_1(p')} - \mu_{G,\zeta_1(p')} \mu_{X,\zeta_1(p')}}{\sigma^2_{G,\zeta_1(p')} + \dfrac{\lambda}{\Gamma_G(p')}}} \tag{5}$$

---

## 5. 输出计算

$$\hat{Z}(p) = \bar{a}_p G(p) + \bar{b}_p \tag{6}$$

$$\bar{a}_p = \frac{1}{|\zeta_1(p)|}\sum_{p' \in \zeta_1(p)} a_{p'}, \quad \bar{b}_p = \frac{1}{|\zeta_1(p)|}\sum_{p' \in \zeta_1(p)} b_{p'}$$

---

## 6. 与 GIF 的对比

| 特性 | GIF | WGIF |
|------|-----|------|
| 正则项 | $\epsilon a_k^2$ | $\frac{\lambda}{\Gamma_G(p')} a_{p'}^2$ |
| 边缘处正则化 | 固定 $\epsilon$ | 减小（$\Gamma_G > 1$） |
| 平坦区域正则化 | 固定 $\epsilon$ | 增大（$\Gamma_G < 1$） |
| 梯度反转 | 存在 | 显著减少 |
| 额外计算 | — | $O(N)$ 计算 $\Gamma_G$ |

---

## 7. 算法流程

```
输入：引导图像 G，输入图像 X，窗口半径 ζ₁，参数 λ，ε
输出：滤波结果 Ẑ

// 预计算边缘感知权重
1. var_G_3x3 = box_var(G, 1)           // 3×3 窗口方差
2. Γ_G = mean(var_G_3x3 + ε) / (var_G_3x3 + ε)  // 式(2)

// 主滤波（类似 GIF）
3. mean_G  = box_filter(G, ζ₁)
4. mean_X  = box_filter(X, ζ₁)
5. var_G   = box_var(G, ζ₁)
6. cov_GX  = box_filter(G·X, ζ₁) - mean_G·mean_X
7. a = cov_GX / (var_G + λ/Γ_G)       // 式(5)，自适应正则化
8. b = mean_X - a·mean_G               // 式(4)
9. ā = box_filter(a, ζ₁)
10. b̄ = box_filter(b, ζ₁)
11. Ẑ = ā·G + b̄                        // 式(6)
```

**复杂度：** $O(N)$，与 GIF 相同，仅增加步骤 1-2 的 $O(N)$ 计算。
