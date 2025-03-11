import { SpaceEnv } from "./src/environments/SpaceEnv";

const environment = new SpaceEnv()
environment.reset()

environment.step()