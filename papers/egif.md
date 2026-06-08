# EGIF — 有效引导图像滤波

> **论文：** Effective Guided Image Filtering for Contrast Enhancement  
> **作者：** Zhengguo Li et al.  
> **发表：** IEEE Signal Processing Letters 2018  
> **意义：** 用全局平均方差 $\Gamma$ 替代 GIF 的固定正则化参数，实现自适应对比度增强

---

## 1. GIF 的局限

GIF 使用固定的正则化参数 $\lambda$，对所有窗口一视同仁。在纹理丰富的图像中，$\lambda$ 过小会导致梯度反转；$\lambda$ 过大则过度平滑。

EGIF 的核心改进：用**全局平均方差** $\Gamma$ 自适应调节正则化强度。

---

## 2. 全局平均方差

$$\Gamma = \frac{1}{N} \sum_{k=1}^{N} \sigma_k^2 \tag{1}$$

其中 $\sigma_k^2$ 是以像素 $k$ 为中心的窗口内引导图像的方差，$N$ 是图像总像素数。

**性质：**
- $\Gamma$ 是全图所有窗口方差的均值，是一个**全局常数**（对所有窗口相同）
- 纹理丰富的图像：$\Gamma$ 较大，正则化较强，抑制梯度反转
- 平坦图像：$\Gamma$ 较小，正则化较弱，保留细节

---

## 3. 能量泛函

$$E(a_k, b_k) = \sum_{i \in \omega_k} \left[(a_k I_i + b_k - p_i)^2 + \Gamma \lambda \, a_k^2\right] \tag{2}$$

与 GIF 的区别：正则项从 $\lambda a_k^2$ 变为 $\Gamma \lambda \, a_k^2$，其中 $\Gamma$ 由图像内容自动决定。

---

## 4. 闭式解推导

### 4.1 对 $b_k$ 求偏导

$$b_k = \bar{p}_k - a_k \mu_k \tag{3}$$

### 4.2 对 $a_k$ 求偏导

$$\boxed{a_k = \frac{\text{Cov}(I, p)_k}{\sigma_k^2 + \Gamma \lambda}} \tag{4}$$

**自引导特例（$I = p$）：**

$$a_k = \frac{\sigma_k^2}{\sigma_k^2 + \Gamma \lambda} \tag{5}$$

---

## 5. 输出计算

$$q_i = \bar{a}_i I_i + \bar{b}_i \tag{6}$$

与 GIF 完全相同，只是 $a_k$ 的计算中用 $\Gamma\lambda$ 替代了 $\lambda$。

---

## 6. 对比度增强应用

EGIF 的主要应用是对比度增强。定义细节层 $r = I - q$，增强输出为：

$$f = q + \beta r \tag{7}$$

其中 $\beta > 1$ 是增强因子。为避免噪声放大，要求 $|\nabla r'| \leq |\nabla q|$，推导得：

$$\beta \leq \frac{a_k}{1 - a_k} \tag{8}$$

EGIF 使用自适应增强因子：

$$\beta_k = \gamma \cdot \frac{a_k}{1 - a_k}, \quad 0 < \gamma \leq 1 \tag{9}$$

---

## 7. 算法流程

```
输入：引导图像 I，输入图像 p，窗口半径 r，参数 λ，γ
输出：增强结果 f

// 计算全局平均方差
1. var_k = box_var(I, r)          // 每个窗口的方差 σ²_k
2. Γ = mean(var_k)                // 全局平均方差（式 1）

// 主滤波（类似 GIF，但用 Γλ 替代 λ）
3. mean_I  = box_filter(I, r)
4. mean_p  = box_filter(p, r)
5. cov_Ip  = box_filter(I·p, r) - mean_I·mean_p
6. a = cov_Ip / (var_k + Γ·λ)    // 式(4)
7. b = mean_p - a·mean_I          // 式(3)
8. ā = box_filter(a, r)
9. b̄ = box_filter(b, r)
10. q = ā·I + b̄                   // 式(6)

// 对比度增强
11. β = γ · ā / (1 - ā)           // 式(9)
12. f = q + β·(I - q)             // 式(7)
```

---

## 8. 与 GIF/WGIF 的对比

| 特性 | GIF | WGIF | EGIF |
|------|-----|------|------|
| 正则化 | 固定 $\lambda$ | 自适应 $\lambda/\Gamma_G(p')$ | 全局 $\Gamma\lambda$ |
| 权重类型 | 无 | 逐像素 | 全局常数 |
| 对比度增强 | 不支持 | 不支持 | 支持 |
| 复杂度 | $O(N)$ | $O(N)$ | $O(N)$ |
