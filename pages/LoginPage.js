export class LoginPage {

    constructor(page) {
        this.page = page
    }

    async acessPage() {
        await this.page.goto('http://paybank-mf-auth:3000/');
    }

    async fillCPF(cpf) {
        await this.page.getByRole('textbox', { name: 'Digite seu CPF' }).fill(cpf);
        await this.page.getByRole('button', { name: 'Continuar' }).click();
    }

    async fillPassword(senha) {
        for (const digito of senha) {
            await this.page.getByRole('button', { name: digito }).click();
        }
        await this.page.getByRole('button', { name: 'Continuar' }).click();
    }

    async fillCode2FA(code) {
        await this.page.getByRole('textbox', { name: '000000' }).fill(code);
        await this.page.getByRole('button', { name: 'Verificar' }).click();
    }

    async checkBalance() {
        return this.page.locator('#account-balance')
    }


}