import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetConversationsDto } from '../messages/dto/getConversationsDto';
import { ConversationEntity } from './entity/conversations';
import { Any, Repository } from 'typeorm';

@Injectable()
export class ConversationsService {
    constructor(
        @InjectRepository(ConversationEntity) private readonly conversation: Repository<ConversationEntity>
    ) { }



    async getUserConversations(body: GetConversationsDto) {
        const { limit, page, userId } = (body);
        console.log(typeof body)
        const skip = (page - 1) * limit;
        const [data, total] = await this.conversation.findAndCount({
            where: {
                participants: Any([userId])
            },
            order: {
                updatedAt: "DESC"
            },
            skip,
            take: limit
        });

        return {
            data,
            total,
            page,
            lastpage: Math.ceil(total / limit)
        }

    }
}
