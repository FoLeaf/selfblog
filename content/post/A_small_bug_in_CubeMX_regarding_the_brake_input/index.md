+++
date = '2025-05-24T12:09:21+08:00'
draft = false
title = 'CubeMX关于刹车输入的一个小BUG'
tags = ['STM32', 'CubeMX', '嵌入式']
+++
STM32CUBEMX在配置定时器PWM输出的刹车输入引脚时

要注意配置的刹车极性和对应引脚的上下拉模式是否相反

若不相反，则会导致复位启动时无法产生对应的波形。

经排查，是CUBEMX没有对刹车输入引脚进行正确的初始化，需要手动更改

![CubeMX 定时器刹车输入引脚配置界面截图](assets/b369eec5-fbb0-4825-b768-f2c7d3a0f286.png)

![CubeMX 生成的 GPIO 初始化代码截图：PF9 配置为推挽输出带上拉](assets/323e6a98-7377-4ab5-bec9-ecf75d0aed49.png)
