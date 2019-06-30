// This class is used to send a response code / msg pair back to the routes to respond with
class ApiResponse {
    public responseCode: number;
    public responseMsg: string;
    constructor(responseCode: number, responseMsg: string) {
        this.responseCode = responseCode;
        this.responseMsg = responseMsg;
    }
}

export = ApiResponse;
