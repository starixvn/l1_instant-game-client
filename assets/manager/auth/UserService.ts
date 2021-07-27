import UserServiceClient from "sc-user-service-client";

import * as Configs from "../../configs/Configs";

export default class UserService {
    private static readonly instance: UserServiceClient;

    public static getInstance(): UserServiceClient {
        return this.instance ?? new UserServiceClient(Configs.userServiceUrl);
    }
}
