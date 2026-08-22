/**
 * QQ 皮肤插件，宿主半区。空 apply 给 Loader 一个宿主侧条目，
 * 浏览器半区通过 exports["./client"] 提供。
 */

/** 宿主插件体 —— 本包只贡献浏览器呈现。 */
export function apply(): void {}
