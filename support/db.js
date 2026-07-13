import pgPromise from 'pg-promise';

 const pgp = pgPromise()
 const db = pgp('postgresql://dba:dba@paybank-db:5432/UserDB')

/*
export async function obterCodigo2FA() {
    const query = `
        SELECT code
        FROM public."TwoFactorCode"
        ORDER BY id DESC
        LIMIT 1;
        `

    const result = await db.oneOrNone(query)
    return result.code
    // oneOrNone = função que vai retornar um registo ou retornar nulo. A função é assincrona, precisa de await, a função também leva async no inicio pelo mesmo motivo. 
} 
*/


// melhoria do código, ambientes com multiuso, acesso em paralelo:

export async function obterCodigo2FA(cpf) {
    const query = `
        SELECT t.code
        FROM public."TwoFactorCode" t
		JOIN public."User" u  ON u."id" = t."userId"
		WHERE u."cpf" = '${cpf}'
        ORDER BY t.id DESC
        LIMIT 1;
        `

    const result = await db.oneOrNone(query)
    return result.code
}
// oneOrNone = função que vai retornar um registo ou retornar nulo. A função é assincrona, precisa de await, a função também leva async no inicio pelo mesmo motivo. 