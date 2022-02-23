import UserServiceClient from "sc-user-service-client";

import { getUserServiceURL } from "../../common/helper/UrlHelper";

export default class UserService {
    private static readonly instance: UserServiceClient;

    public static getInstance(): UserServiceClient {
        const userServiceUrl = getUserServiceURL();
        return this.instance ?? new UserServiceClient(userServiceUrl);
    }
}
