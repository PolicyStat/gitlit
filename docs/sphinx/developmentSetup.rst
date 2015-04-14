Setting up the Development Environment
=======================================

Initial Setup
==============
This assumes that the repository location is already cloned locally, and there is some from of vm software available.

Starting off, download vagrant http://www.vagrantup.com/downloads.html as appropriate to the local system, and install it.
Launch a terminal window [if on windows use the git bash], and navigate to the repository location.
The correct directory should have a subfolder within it called '.vagrant'.
While in that directory call the command 'vagrant up'. This will download the necessary image and set it up with the environment used for testing.
Use 'vagrant ssh' after the command has successfully finished to enter the vm and then use 'cd /vagrant/' to get to the directory it was launched from.
The command 'exit' will logout from the vagrant vm.
When use or testing is complete, run 'vagrant halt' to shut down the vm gracefully.

After Initial Setup
====================
Once the development has been setup initially, the vm can be re-entered by simply using the 'vagrant ssh' command again, assuming it has not been ended with halt.
If it has been ended, calling 'vagrant up' will check for updates and then launch the vm for use.

Errors in File Location After Initial Setup
============================================
There is an error that occasionally arises with vagrant where it points to an incorrect location for the vm.
The generic fix for this is to delete or remove the vm from the vm software being used, and use 'vagrant up' to restablish the vm. 