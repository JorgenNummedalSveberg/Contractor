import { User } from "discord.js";
import { CommandoClient, Command, CommandMessage } from "discord.js-commando";
const PDFDocument = require('pdfkit');
import * as fs from "fs";

module.exports = class InfoCommand extends Command {
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'contract',
            aliases: ['contract'],
            group: 'bot',
            memberName: 'contract',
            description: 'shows you contract'
        });
    }

    fixMention(mention) {
        return mention.replace("<", "").replace(">", "").replace("@", "").replace("!", "");
    }

    async run(msg: CommandMessage, notUsed) {
        let returnString = "";
        try {
            const args = msg.message.content.split(" ").slice(1);
            const end = msg.message.content.split("!").slice(2);
            const punishments = msg.message.content.split("&").slice(1);
            const sender: User = msg.message.author;
            let mentionID;
            const mention = msg.mentions.members.first().user;
            mention ? mentionID = mention.id : mentionID = 'No user was mentioned';
            if (mentionID != this.fixMention(args[0]) || args.length < 3) {
                returnString = "Message structure: §contract co-signer <anime you will watch> <anime they will watch> <when to finish viewing> <punishment 1> <punishment 2> ...";
            } else {
                returnString = `You made a contract!\n${args.join(";")}`;
                let index = 0;
                let saved = false;
                while (!saved) {
                    if (index > 10) {
                        break;
                    }

                    let fileString = 'contracts/'+sender.username +" - "+mention.username+" - "+index+".pdf";
                    fileString = fileString.replace(" ", "");
                    console.log(fileString);
                    const exists = fs.existsSync(fileString);

                    if (exists) {
                        index++;
                        console.log("already exists, adding iteration")
                    } else {
                        const doc = new PDFDocument({compress:false});
                        const writeStream = fs.createWriteStream(fileString);
                        doc.pipe(writeStream);
                        { // top lines
                            doc.lineWidth(30);
                            doc.lineCap('butt')
                                .moveTo(0, 15)
                                .lineTo(620, 15)
                                .stroke("#c4a06c");
                            doc.lineCap('butt')
                                .moveTo(0, 0)
                                .lineTo(620, 0)
                                .stroke("#000000");
                        }
                        { // Header
                            doc.font('Helvetica-Bold')
                                .fontSize(20)
                                .text('Anime kontrakt', 50, 60);
                        }
                        { // thindivider
                            doc.lineWidth(2);
                            doc.lineCap('butt')
                                .moveTo(5, 90)
                                .lineTo(607, 90)
                                .stroke("#000000");
                        }
                        { // beskrivelse
                            doc.font('Helvetica')
                                .fontSize(12);
                            doc.text(`Denne anime kontrakten er mellom følgende parter:${sender.username}, ${mention.username}`, 50, 150);
                            doc.text(`Kontrakten innebærer disse punkter:`, 50, 200);
                            doc.text(`A) ${sender.username} skal se ferdig serien/filmen: ${args[1]}`, 50, 215);
                            doc.text(`B) ${mention.username} skal se ferdig serien/filmen: ${args[2]}`, 50, 230);
                            if (end.length > 0) {
                                doc.text(`C) Dette skal skje innen ${end[0]}`, 50, 245);
                            }
                            if (punishments.length > 0) {
                                doc.text(`Parter som feiler i å fullføre sin serie skal:`, 50, 280);
                                punishments.forEach((x, index) => {
                                    doc.text(`${"i".repeat(index+1)}) ${x}`, 50, 280+15*(index+1))
                                })
                            }
                        }
                        doc.save();
                        doc.end();
                        writeStream.on('finish', function () {
                            msg.channel.send("Here's your contract", {files: [fileString]});
                        });
                        return msg.channel.send("Creating contract...");
                    }
                }
                return msg.channel.send("There was an error saving the pdf");
            }
        } catch (e) {
            console.log(e)
        }

        return msg.channel.send("Message structure: §contract co-signer your-anime their-anime !when to end! &punishment 1&punishment 2...")
    }
}
