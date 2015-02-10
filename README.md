relative-viewport
=================

relative viewport form mobile app

手机HTML5 APP 相对屏幕适配工具

无需在写繁琐的响应式代码，完全的relative layout方式。比如把body设置成640px,就完全按照640px来做，甚至可以全部absolute定位来拼凑界面

使用方法在head引入js文件
```
 <script type="text/javascript" src="relative.viewport.js"></script>
```
注意必须在head引入，因为viewport是在页面初始化渲染的时候生效，这个工具通过动态计算比列来实现的相对视口布局

option配置项：
```
 <script type="text/javascript" src="relative.viewport.js" content="wdith=640"></script>
```
配置项可以填写在引入标签的content属性中。

- width:页面设计宽度 默认为480
- targetDensitydpi: dpi属性， android4.4以后已经移除
- userScalable:是否支持手势缩放 "yes or no"
- maximumScale:最大缩放值 "int"
- minimumScale:最小缩放值 "int"

如index.html示列中，按照一个固定宽度来设计界面即可

提示：这个方法方便快速开发移动应用，但是完全利用的scale机制，在高分辨率上细腻度没有标准viewport适配效果好。而且随着系统更新支持上可能会有新问题，实际项目建议还是使用标准的viewport来进行屏幕适配

新增android 5.0适配