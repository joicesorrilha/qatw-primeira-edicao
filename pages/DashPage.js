export class DashPage {

    constructor(page) {
        this.page = page
    }

      async checkBalance() {
        return this.page.locator('#account-balance')
    }


}

