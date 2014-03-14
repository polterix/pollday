role :web, "#{application}.dev.scoua.de"

set :deploy_to,     "/var/www/#{application}.dev.scoua.de"
set :domain,      "#{application}.dev.scoua.de"

ssh_options[:user] = 'capistrano'
