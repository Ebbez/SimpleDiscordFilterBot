const discord = require('discord.js');
const config = require('./botConfig.json');
const client = new discord.Client();

const deleteAndWarn = (listConfig, message, explicit=false) => {
  var slur = ""
  if (explicit) {
    eSlur = listConfig.explicitList.find(word => message.content.toLowerCase().includes(word))
    slurPos = message.content.toLowerCase().search(eSlur);
    if (message.content.length == eSlur.length) slur = eSlur
    else if (message.content.length > eSlur.length) {
      if (slurPos == 0 && message.content.substr(slurPos + eSlur.length, 1) == " ") slur = eSlur
      else if (slurPos == message.content.length - eSlur.length && message.content.substr(message.content.length - eSlur.length - 1, 1) == " ") slur = eSlur
      else if (message.content.substr(slurPos + eSlur.length, 1) == " " && message.content.substr(slurPos - 1, 1) == " ") slur = eSlur
      else return
    }
  } else slur = listConfig.list.find(word => message.content.toLowerCase().includes(word))

  var defaultMessage = listConfig.warningMessage.replace("%user%", "<@" + message.author.id + ">").replace("%message%", message.content).replace("%channel%", message.channel.name).replace("%word%", slur);
  if (defaultMessage.length < 2000) {
    message.guild.channels.cache.get(listConfig.warningChannelID).send(defaultMessage);
  } else {
    message.guild.channels.cache.get(listConfig.warningChannelID).send(listConfig.warningMessage.replace("%user%", "<@" + message.author.id + ">").replace("%message%", "SEE BELOW").replace("%channel%", message.channel.name).replace("%word%", slur));
    message.guild.channels.cache.get(listConfig.warningChannelID).send("```" + message.content.substring(0,message.content.length-6) + "```");
  }

  message.author.send(config.warningResponse).catch(() => {
    message.reply(config.warningResponse)
  });
  message.delete();
}

client.on('message', (msg) => {
  if (msg.author == client.user || msg.channel.type != "text" || config.exempt.users.includes(msg.author.id) || config.exempt.channels.includes(msg.channel.id)) return;

  if (config.badSlurConfig.list.some(word => msg.content.toLowerCase().includes(word))) {
    deleteAndWarn(config.badSlurConfig, msg);
  } else if (config.badSlurConfig.explicitList.some(word => msg.content.toLowerCase().includes(word))) {
    deleteAndWarn(config.badSlurConfig, msg, true)
  } else if (config.mildSwearConfig.list.some(word => msg.content.toLowerCase().includes(word))) {
    deleteAndWarn(config.mildSwearConfig, msg);
  } else if (config.mildSwearConfig.explicitList.some(word => msg.content.toLowerCase().includes(word))) {
    deleteAndWarn(config.mildSwearConfig, msg, true)
  }

  /* Specific commands requested by CWOPK community.
  if (msg.content.startsWith("+NETU!!!")) {
    var options = ["shut the up.", "reeeeeee,", "no,"]
    msg.reply(options[Math.floor(Math.random()*options.length)] + " I work unlike <@734554755640066168>")
  } else if (msg.content.toLowerCase().startsWith("+bean")) {
    msg.channel.send("https://i.kym-cdn.com/photos/images/newsfeed/001/166/993/284.png")
  }
  */
})

client.on('ready', () => {
  console.log(`The bot successfully logged in as ${client.user.tag}`)
  client.user.setActivity(config.activity.description, {type: config.activity.type})
})

client.login(config.token);
