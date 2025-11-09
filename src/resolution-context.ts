import { Registration } from "./dependency-container";

export class ResolutionContext {
    scopedResolutions = new Map<Registration, any>();
}
