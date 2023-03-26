import uuid4 from "uuid4";
import jwt from "jsonwebtoken";
import {sendMessageToQueue} from "../../index.js";
import "../../node_modules/dotenv/config.js";
import User from '../../models/user.model.js';
import { APIService } from '../services/APIService.js';
import { TokenService } from '../services/TokenService.js';
// let channel;
// async function connect() {
//     await amqp.connect("amqp://127.0.0.1")
//   .then(async(connection) => {
//     // console.log(connection)
//     // Create a channel
//     return connection.createChannel()
//       .then(async(channel) => {
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//   });
// }


// connect();

// const sendMessageToQueue = async (message) => {
//   try {
//     await channel.sendToQueue('myQueue', Buffer.from(message));
//     console.log('Message sent to RabbitMQ:', message);
//   } catch (error) {
//     console.error('Failed to send message to RabbitMQ:', error);
//   }
// };

export const signUp = async(req, res) => {
  try {
    const tokenService = new TokenService();
    const apiService = new APIService(tokenService);
    const data = req.body;
    console.log(data);
    if(!data || !data.firstname || !data.lastname || !data.email || !data.password){
      await sendMessageToQueue('sent the response to the client');
      res.status(409).json({error: "FirstName, LastName, email & Password are compulsory to signup"})
    }else{
      // const getRoombyName = await apiService.get(`/rooms?name=${}`).then(async(rooms) => {
        // console.log(rooms)
        const uuid = uuid4();
        const payload = {
          name: uuid,
          description: data.email,
          template_id: "641d46abc719ba667aeab6eb"
        }
        const roomData = await apiService.post(`/rooms`, payload).then(async(result) => {
          await sendMessageToQueue('sent the response to the client');
          console.log(result)
          const body = {
            uuid: uuid,
            firstName: data.firstname,
            lastName: data.lastname,
            email: data.email,
            password: data.password,
            roomId: result.id,
          }
          await User.create(body).then((response) => {
            res.status(201).json({message: response});
          })
          // const liveStreamBody = {
          //   meeting_url: data.email,
          //   recording: {
          //     hls_vod: true,
          //     single_file_per_layer: false
          //   }
          // }
          // apiService.post(`/live-streams/room/${result.id}/start`, liveStreamBody).then((streamData) => {
          //   res.send(streamData);
          // })
        })
      // })
      // if(getRoombyName.status){
      //   res.status(409).json({error: "Email already in use."})
      // }else if(!getRoombyName){

      // }
    }
  } catch (error) {
    console.log(error)
    res.status(409).json({error: error.message});
  }
}

export const login = async(req, res) => {
  const { email, password } = req.body;

  // Check if the email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find the user with the provided email
    const user = await User.findOne({ email });

    // Check if the user exists and the password is correct
    if (!user || !(await user.isValidPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn: "24h"});
    console.log(token)
    // Send the token in the response
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const createLiveStream = async(req, res) => {
  try {
    const tokenService = new TokenService();
    const apiService = new APIService(tokenService);
    var token = req.body.token;
    console.log(token.Bearer)
    let verifyToken = jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        // The token is invalid or has expired
        console.error(err);
      } else {
        // The token is valid and has not expired
        console.log(decoded); // The decoded payload of the token
        let user = await User.findById(decoded.userId);
        if(user){
          // const token = tokenService.getAuthToken({ room_id: user.roomId, user_id: user.customer, role: 'Host' });
          const liveStreamBody = {
              meeting_url: `https://${user._id}.app.100ms.live/preview/${user.roomId}/Host?skip_preview=true`,
              recording: {
                hls_vod: true,
                single_file_per_layer: false
              }
            }
            await apiService.post(`/live-streams/room/${user.roomId}/start`, liveStreamBody).then(async(streamData) => {
              await User.findByIdAndUpdate(user._id, {liveStreamId: streamData.id}).then((ressult) => {
                sendMessageToQueue(streamData.meeting_url);
                  res.send(streamData);
              })
              }).catch((Err) => {
                res.send(Err.message)
              })
        }else{
          res.status(409).json({error: "Something went wrong"})
        }
      }
    })
  } catch (error) {
    console.log(error)
    res.status(409).json({error: error.message})
  }
}

export const stopLiveStream = async(req, res) => {
  try {
    const data = req.body;
    const tokenService = new TokenService();
    const apiService = new APIService(tokenService);
    if(!data || !data.token){
      res.status(409).json({error: "please enter your login token"})
    }else{
      let verifyToken = jwt.verify(data.token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          // The token is invalid or has expired
          console.error(err);
        } else {
          let user = await User.findById(decoded.userId);
          if(user) {
            apiService.post(`/live-streams/${user.liveStreamId}/stop`).then(() => {
              sendMessageToQueue(`${user.roomId} live stream ended`);
                res.status(200).json({message: `${user.roomId} live stream ended`});
              }).catch((err) => {
                console.log(err.message)
              })
          }else{
            res.status(409).json({error: "Something went wrong"})
          }
        }
      })
    }
  } catch (error) {
    console.log(error)
    res.status(409).json({error: error.message})
  }
}