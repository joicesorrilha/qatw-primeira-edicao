import { Queue } from "bullmq";

const connection = {
    host: 'paybank-redis',
    port: 6379
}

const queueName = 'twoFactorQueue'

const queue = new Queue(queueName, {connection})

export const getJob = async() => {
    const jobs = await queue.getJobs()  //busca todos os jobs
    console.log(jobs[0].data.code)
    return jobs[0].data.code                //retorna somente a primeira posição (que pode não ser a ultima) e por isso temos a função abaixo.
}

export const cleanJobs = async() => {
    await queue.obliterate()      // limpa/apaga a fila do redis, todas as mensagens da fila.
}