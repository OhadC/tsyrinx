import { RegistryBase } from "./registry-base";
import type { InterceptionOptions } from "./types";
import type { PostResolutionInterceptorCallback, PreResolutionInterceptorCallback } from "./types/dependency-container";

export type PreResolutionInterceptor = {
    callback: PreResolutionInterceptorCallback;
    options: InterceptionOptions;
};

export type PostResolutionInterceptor = {
    callback: PostResolutionInterceptorCallback;
    options: InterceptionOptions;
};

export class PreResolutionInterceptors extends RegistryBase<PreResolutionInterceptor> {}

export class PostResolutionInterceptors extends RegistryBase<PostResolutionInterceptor> {}

export class Interceptors {
    public preResolution: PreResolutionInterceptors = new PreResolutionInterceptors();
    public postResolution: PostResolutionInterceptors = new PostResolutionInterceptors();
}
