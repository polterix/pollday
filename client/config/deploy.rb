set :application, "pollday"

set :stages, %w(dev preprod prod)

set :shared_files,     []
set :shared_children,  ["config"]

set :scm, :none
set :repository, "#{File.expand_path('.')}/dist"
set :deploy_via, :copy

set :copy_exclude, [".git", ".DS_Store", ".gitmodules"]

set :use_sudo, false
set :keep_releases, 3

set :slack_subdomain, 'lns'
set :slack_token, ''

namespace :grunt do
    task :build do
        logger.info "Grunt build"
        system("cd " + repository + " && cd .. && grunt build") or fail
    end
end

before 'deploy', 'grunt:build'
