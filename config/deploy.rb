set :application, "pollday-server"

# set :scm, :git # You can set :scm explicitly or Capistrano will make an intelligent guess based on known version control directory names
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`
#
# Multistage support - see config/deploy/[STAGE].rb for specific configs
set :default_stage, "dev"
set :stages, %w(dev)

set :shared_files,     []
set :shared_children,  ["config"]

####################################################
# Set the repository type and location to deploy from.

# GITHUB
set :scm, :git
set :repository, "git@github.com:LaNetscouade/pollday.git"
set :branch, "master"
set :repository_cache, "git_cache"
set :ssh_options, { :forward_agent => true }
set :deploy_via, :remote_cache
set :copy_exclude, [ '.git', 'config' ]

# Generally don't need sudo for this deploy setup
set :use_sudo, false
# Keep the last 3 releases
set :keep_releases, 3

default_run_options[:pty] = true

namespace :node do
    desc "Check required packages and install if packages are not installed"
    task :install_packages do
        run "cd #{release_path} && npm install --loglevel warn"
    end
end

namespace :pollday do
    task :restart do
        run "pkill -f pollday"
    end
end

after "deploy:finalize_update", "node:install_packages", "pollday:restart"

