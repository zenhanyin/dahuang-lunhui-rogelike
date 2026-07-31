# 地图包规范

每个地图包都使用相同目录结构，但美术元素必须按场景单独设计。

必需目录：

- `base_tiles/`：静态无缝地表 tile。
- `decals/`：贴地纹路和地表痕迹。
- `props_static/`：静态摆件。
- `props_animated/`：循环摆件。
- `story_markers/`：剧情点位三态。
- `events/`：剧情交互物件。
- `atmosphere/`：动态空气层，首版可空。

绘制顺序：base tile -> decal -> low props -> drops/projectiles -> characters/enemies -> tall props/events by world y -> VFX/damage text -> UI。

约束：base tile 不要中心光，不要大块切边；decal 必须贴地，不能像云雾独立漂浮。
