=======================================
Exercise 2 - Troubleshooting, Logs, etc
=======================================

In the Training Lab intro I referenced the DevOps mantra:
  "Fail fast, fail forward".

Well, this is best achieved with a solid understanding of troubleshooting best-
practices.

The two primary logs you will need are:

`/var/log/restjavad/restjavad.0.log`
`/var/log/restnoded/restnoded.log`

When testing changes you've made to an iControlLX extension, its very helpful
to `tail` the restnoded.log file to see that it loaded properly and to read
any debug information from you iControlLX extension.

1) Loading a new extension is performed by restarting the `restnoded` daemon.
To see the output from restnoded when it loads iControlLX extensions, execute:

  `bigstart restart restnoded; tail -f /var/log/restnoded/restnoded.log`

2) Review the  
