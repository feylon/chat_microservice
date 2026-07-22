import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MessageEntity } from '../../messages/entity/messages';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fileName!: string;

  @Column()
  filePath!: string;

  @Column()
  mimeType!: string;

  @Column('int')
  fileSize!: number;

  @Column({ type: 'uuid', nullable: true })
  messageId!: string | null;

  @OneToOne(() => MessageEntity, (message) => message.file, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message!: MessageEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
