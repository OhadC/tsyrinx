import { Lifecycle } from "./lifecycle";

export type RegistrationOptions = {
  /**
   * Customize the lifecycle of the registration
   * See https://github.com/microsoft/tsyringe#available-scopes for more information
   */
  lifecycle: Lifecycle;
};

