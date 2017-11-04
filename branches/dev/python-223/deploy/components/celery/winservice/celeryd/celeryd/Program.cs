using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ServiceProcess;
using System.IO;

namespace celeryd
{
    class Program : ServiceBase
    {
        private System.Diagnostics.Process proc = null;
        private StreamWriter tw = null;
        private FileStream log = null;

        static void Main(string[] args)
        {
            ServiceBase.Run(new Program());
        }

        public Program()
        {
            this.ServiceName = "celeryd";
        }

        protected override void OnStart(string[] args)
        {
            base.OnStart(args);

            proc = new System.Diagnostics.Process();
            proc.EnableRaisingEvents = false;
            proc.StartInfo.FileName = "c:\\python27\\python.exe";
            proc.StartInfo.CreateNoWindow = true;
            proc.StartInfo.Arguments = "-m celery.bin.celeryd --queues xdt";
            proc.StartInfo.WorkingDirectory = "c:\\2.0\\flx\\pylons\\flx";
            //proc.StartInfo.RedirectStandardError = true;
            //proc.StartInfo.RedirectStandardOutput = true;

            //proc.StartInfo.UseShellExecute = false;
            
            //log = new FileStream("c:\\2.0\\flx\\pylons\\flx\\celeryd.log", FileMode.Append);
            //tw = new StreamWriter(log);
            //tw.AutoFlush = true;
            //Console.SetOut(tw);

            proc.Start();

            /*
            string str;
            TextWriter tw = new StreamWriter("c:\\2.0\\flx\\pylons\\flx\\celeryd.log");
            StreamReader reader = proc.StandardError;
            while ((str = reader.ReadLine()) != null)
            {
                tw.WriteLine(str);
                tw.Flush();
            }

            reader = proc.StandardOutput;
            while ((str = reader.ReadLine()) != null)
            {
                tw.WriteLine(str);
                tw.Flush();
            }
            tw.Close();
             */
            //proc.WaitForExit();
        }

        protected override void  OnStop()
        {
 	        base.OnStop();

            if (this.proc != null) {
                this.proc.Kill();
                this.proc.WaitForExit();
            }
        }
    }
}
