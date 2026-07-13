import { MessageEntity } from 'src/messages/entity/messages';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';

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

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => MessageEntity, (message) => message.file)
  message!: MessageEntity;
}