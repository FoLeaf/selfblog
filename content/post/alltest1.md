+++
date = '2025-04-04T13:05:19+08:00'
draft = false
title = '全场景md测试'
slug = 'slugtest'
robotsNoIndex = true
+++
# Markdown 全格式测试文档

## 1. 标题与段落
这是普通段落，展示**加粗**、*斜体*、~~删除线~~和`行内代码`。  
换行需在行尾添加两个空格或使用`<br>`标签。

## 2. 列表与任务
### 无序列表
- 苹果
- 香蕉
  - 进口香蕉
  - 本地香蕉

### 有序列表
1. 打开IDE
2. 创建项目
3. 编写代码

### 任务列表
- [x] 学习Markdown基础
- [ ] 掌握高级表格技巧

## 3. 代码与语法高亮
行内代码：`print("Hello Markdown")`

```python
# Python代码块
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)
```

```javascript
// JavaScript代码块
const greet = (name) => console.log(`Hello ${name}!`);
```

## 4. 表格与引用
| 语言       | 热度 | 特性          |
|------------|:----:|--------------|
| Python     | ★★★★ | 简洁易读      |
| JavaScript | ★★★★☆| 全栈开发      |
| Rust       | ★★★★ | 内存安全      |

> **引用块嵌套示例**  
> > 二级引用：代码是诗，注释是散文  
> >> 三级引用：好代码会自己说话

## 5. 数学公式（KaTeX）
行内公式：$\frac{\partial f}{\partial t} = \nabla \cdot (D \nabla f)$

块级公式：
$$
\begin{bmatrix}
a & b \\
c & d 
\end{bmatrix}
\begin{bmatrix}
x \\
y 
\end{bmatrix}
=
\begin{bmatrix}
\alpha \\
\beta 
\end{bmatrix}
$$

## 6. 扩展功能
### 折叠内容
<details>
<summary>点击查看配置说明</summary>

```yaml
# 服务器配置
server:
  port: 8080
  ssl: true
```
</details>

### 脚注示例
这是一个带有脚注的句子

: 这是第一个脚注的内容
: 引用自Markdown教程
: 表格技巧详见速优物联指南
```

---

**关键语法说明**：
1. 代码块使用三个反引号包裹并指定语言类型（如`python`）可实现语法高亮
2. 数学公式通过`$...$`（行内）和`$$...$$`（块级）实现科技文档排版
3. 表格对齐使用冒号标记（`:---`左对齐、`:---:`居中、`---:`右对齐）
4. 折叠区块需配合HTML的`<details>`标签实现交互效果
5. 任务列表通过短横线+方括号（`- [ ]`）创建待办事项
