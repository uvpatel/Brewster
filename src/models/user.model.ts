import { models, model , Schema} from "mongoose"
import type { IUser } from "@/types/user.type"


const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: Number,
        required: true,
    
    }
} , { timestamps: true})



export  const User = models.User || model<IUser>("User",userSchema)


        